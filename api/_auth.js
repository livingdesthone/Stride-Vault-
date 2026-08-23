import crypto from "node:crypto";
const COOKIE="sv_admin";
function secret(){return process.env.ADMIN_SESSION_SECRET||"";}
function sign(v){return crypto.createHmac("sha256",secret()).update(v).digest("hex");}
export function makeSession(){const p=Buffer.from(JSON.stringify({exp:Date.now()+604800000})).toString("base64url");return `${p}.${sign(p)}`;}
export function isAdmin(req){if(!secret())return false;const m=(req.headers.cookie||"").match(/(?:^|;\\s*)sv_admin=([^;]+)/);if(!m)return false;const [p,s]=m[1].split(".");if(!p||!s)return false;const e=sign(p);if(s.length!==e.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(e)))return false;try{return JSON.parse(Buffer.from(p,"base64url").toString()).exp>Date.now()}catch{return false}}
export function sessionCookie(s){return `${COOKIE}=${s}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;}
