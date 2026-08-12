const { Client } = require('pg')
require('dotenv').config()

const connectionString=process.env.DATABASE_DIRECT_URL||process.env.DATABASE_URL
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms))

async function main(){
  if(!connectionString)throw new Error('DATABASE_DIRECT_URL o DATABASE_URL es obligatoria')
  const client=new Client({connectionString});await client.connect()
  try{
    const {rows}=await client.query(`SELECT id,external_id,locality,source_data,ST_Y(coordinates::geometry) latitude,ST_X(coordinates::geometry) longitude FROM incidents WHERE source_name='Mapa de emergencia · Cali' AND COALESCE(source_data->>'territorialStatus','pending')='pending' ORDER BY created_at DESC`)
    console.log(`Territorios pendientes: ${rows.length}`)
    let resolved=0,outside=0,unresolved=0
    for(let index=0;index<rows.length;index++){
      const row=rows[index],url=new URL('https://nominatim.openstreetmap.org/reverse');url.search=new URLSearchParams({format:'jsonv2',lat:String(row.latitude),lon:String(row.longitude),zoom:'10',addressdetails:'1',layer:'address'}).toString()
      try{
        const response=await fetch(url,{headers:{accept:'application/json','user-agent':'ColombiaResponde/0.1 (https://colombiaresponde.kitotsu.dev)'},signal:AbortSignal.timeout(15000)})
        if(!response.ok)throw new Error(`HTTP ${response.status}`)
        const result=await response.json(),address=result.address||{},countryCode=String(address.country_code||'').toLowerCase(),base={...(row.source_data||{}),geocodingAttribution:'OpenStreetMap contributors · Nominatim'}
        if(countryCode!=='co'){
          await client.query(`UPDATE incidents SET status='archived',source_data=$2::jsonb WHERE id=$1`,[row.id,JSON.stringify({...base,territorialStatus:countryCode?'outside_colombia':'unresolved',resolvedCountry:address.country||undefined})]);countryCode?outside++:unresolved++
        }else{
          const municipality=address.city||address.town||address.municipality||address.village||address.county||'Municipio por determinar',department=address.state||address.region||'Departamento por determinar',territory={departmentCode:'',departmentName:department,municipalityCode:'',municipalityName:municipality,locality:String(address.suburb||address.neighbourhood||address.hamlet||row.locality||result.display_name||'').slice(0,160)}
          await client.query(`UPDATE incidents SET department_code='',department_name=$2,municipality_code='',municipality_name=$3,locality=$4,source_data=$5::jsonb WHERE id=$1`,[row.id,department,municipality,territory.locality,JSON.stringify({...base,territorialStatus:'resolved',territory})]);resolved++
        }
      }catch(error){console.error(`Error ${row.external_id}: ${error.message}`)}
      if((index+1)%10===0||index+1===rows.length)console.log(`${index+1}/${rows.length} · resueltos ${resolved} · fuera de Colombia ${outside} · sin resolver ${unresolved}`)
      if(index+1<rows.length)await wait(1100)
    }
  }finally{await client.end()}
}
main().catch(error=>{console.error(error);process.exit(1)})
