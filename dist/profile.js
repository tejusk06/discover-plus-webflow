"use strict";(()=>{Webflow.push(function(){window.$memberstackDom.getCurrentMember().then(({data:u})=>{if(u){let f=localStorage.getItem("imageFile"),T=localStorage.getItem("imageUrl"),E=window.location.href,g=new URLSearchParams(new URL(E).search),M=document.querySelector('[discover-element="update-password"]'),H=document.querySelector('[discover-element="submit-password"]'),S=document.querySelector(".profile_header_form-error"),U=document.querySelector('[discover-element="new-password"]'),x=document.querySelector('[discover-element="new-password2"]'),p=localStorage.getItem("types"),c=p==null?void 0:p.split(","),y=localStorage.getItem("fields"),a=y==null?void 0:y.split(","),h=document.querySelectorAll('[discover-element="type-embed"]'),q=document.querySelectorAll('[discover-element="field-embed"]'),i=document.querySelector('[discover-element="type-template"]'),d=document.querySelector('[discover-element="field-template"]'),j=document.querySelector('[d-e="types-form"]'),z=document.querySelector('[d-e="fields-form"]'),R=document.querySelector('[d-e="update-types"]'),B=document.querySelector('[d-e="update-fields"]'),b=document.getElementById("image-form"),F=document.querySelector("#image-input"),v=document.querySelector('[data-ms-member="profile-type"]'),m=document.querySelector('[discover-element="age-wrap"]');if(T&&f&&(document.querySelector('[discover-element="profile-image"]').src=f),g.has("tab")){let t=g.get("tab");document.querySelector(`[data-w-tab="${t}"]`).click()}M.addEventListener("click",()=>{U.value===x.value?(S.style.display="none",H.click()):S.style.display="block"});let w=t=>{i.style.display="flex";let{parentElement:o}=i,{children:l}=o;for(let e=l.length-1;e>0;e--)o.removeChild(l[e]);h.forEach(e=>{let r=e.querySelector(".profile_header_interests-id").innerHTML;if(c!=null&&c.includes(r)){t==="localStorage"&&e.getElementsByTagName("input")[0].click();let n=e.querySelector(".profile_header_tabs-interest").innerHTML,s=i.cloneNode(!0);s.innerHTML=n,i.parentElement.append(s)}}),i.style.display="none"},_=t=>{d.style.display="flex";let{parentElement:o}=d,{children:l}=o;for(let e=l.length-1;e>0;e--)o.removeChild(l[e]);q.forEach(e=>{let r=e.querySelector(".profile_header_interests-id").innerHTML;if(a!=null&&a.includes(r)){t==="localStorage"&&e.getElementsByTagName("input")[0].click();let n=e.querySelector(".profile_header_tabs-interest").innerHTML,s=d.cloneNode(!0);s.innerHTML=n,d.parentElement.append(s)}}),d.style.display="none"};w("localStorage"),_("localStorage");let k=(t,o)=>{var l=new Headers;l.append("Content-Type","application/json");let e=localStorage.getItem("airtableId");var r=JSON.stringify({event:t,payload:o,id:e}),n={method:"PUT",headers:l,body:r,redirect:"follow"};fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/${u.id}`,n).then(s=>s.text()).then(s=>{var I,L;t==="types.updated"?(w("api"),localStorage.setItem("types",c.join(",")),(I=document.querySelector('[discover-element="add-remove-types"]'))==null||I.click()):t==="fields.updated"&&(_("api"),localStorage.setItem("fields",a.join(",")),(L=document.querySelector('[discover-element="add-remove-fields"]'))==null||L.click()),console.log(s)}).catch(s=>console.log("error",s))};R.addEventListener("click",t=>{c=[],h.forEach(o=>{let l=o.querySelector(".profile_header_interests-id").innerHTML,e=o.querySelector('[d-e="checkbox"]'),r=!1;e.classList.contains("w--redirected-checked")&&(r=!0,c.push(l))}),k("types.updated",c)}),B.addEventListener("click",t=>{a=[],q.forEach(o=>{let l=o.querySelector(".profile_header_interests-id").innerHTML,e=o.querySelector('[d-e="checkbox"]'),r=!1;e.classList.contains("w--redirected-checked")&&(r=!0,a.push(l))}),k("fields.updated",a)}),F.addEventListener("change",t=>{if(t.target.files[0].size>1*1024*1024){console.error("File size exceeds 1MB limit"),document.querySelector(".profile_header_image-message").innerHTML="File size sould be less than 1mb",document.querySelector(".profile_header_image-message").style.display="block";return}document.querySelector(".profile_header_image-message").style.display="none",document.querySelector("#profile_header_image-button").style.display="block"});let C=async t=>{try{let l=await(await fetch(t)).blob(),e=new FileReader;e.onloadend=function(){let r=e.result;localStorage.setItem("imageFile",r),localStorage.setItem("imageUrl",t),document.querySelector('[discover-element="navbar-image"]').src=r,document.querySelector('[discover-element="profile-image"]').src=r},e.readAsDataURL(l)}catch(o){console.error("Error fetching and storing image:",o)}};b.addEventListener("submit",async function(t){t.preventDefault(),document.querySelector(".profile_header_image-message").innerHTML="Uploading Image",document.querySelector(".profile_header_image-message").style.display="block";let o=localStorage.getItem("airtableId");if(document.querySelector("#image-input").files[0].size>1*1024*1024){console.error("File size exceeds 1MB limit");return}let e=new FormData(b);e.append("id",`${o}`);let r=await fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/${u.id}`,{method:"PUT",body:e,event:"image.updated"});if(r.ok){let n=await r.json();console.log("Image uploaded successfully",n),C(n.imageUrl),document.querySelector(".profile_header_image-message").style.display="none"}else document.querySelector(".profile_header_image-message").innerHTML="Error",console.error("Error uploading image:",r.status,r.statusText)}),v.addEventListener("change",function(t){t.target.value==="Student"?m.style.display="block":m.style.display="none"}),v.value==="Student"?m.style.display="block":m.style.display="none"}})});})();
