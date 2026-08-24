import {makeSession,sessionCookie} from "./_auth.js";
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({ok:false,error:"Method not allowed"});
 try{
  const configured=!!process.env.ADMIN_PASSWORD;
  const sessionConfigured=!!process.env.ADMIN_SESSION_SECRET;
  if(!configured||!sessionConfigured)return res.status(500).json({ok:false,error:"ADMIN_PASSWORD or ADMIN_SESSION_SECRET is missing from this deployment."});
  const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):req.body||{};
  const password=typeof body.password==="string"?body.password:"";
  if(!password||password!==process.env.ADMIN_PASSWORD)return res.status(401).json({ok:false,error:"Invalid admin password."});
  res.setHeader("Set-Cookie",sessionCookie(makeSession()));
  return res.status(200).json({ok:true});
 }catch(e){return res.status(500).json({ok:false,error:"Login server error. Check Vercel deployment logs."});}
}
