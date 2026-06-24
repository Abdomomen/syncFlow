// edit
// delete

import { NextResponse } from "next/server";
import { subServices } from "@/app/services/subServices";
import { subSchema } from "@/app/services/validations/sub";
import { verifyToken } from "@/app/services/jwt";

export async function PUT(req,{params}){
    try {
        let {id}= await params
        let token= req.headers.get("authorization")
        if(!token || !token.startsWith("Bearer ")){
            return NextResponse.json({
                success:false,
                message:"Unauthenticated"
            },{status:401})
        }
        token=token.split(" ")[1]
        let decoded=verifyToken(token)
        if(!decoded){
            return NextResponse.json({
                success:false,
                message:"Invalid Token"
            },{status:401})
        }
        let {title,price,next}= await req.json()
        let res= subSchema.safeParse({title,price:+price,next})
        if(!res.success){
            return NextResponse.json({
                success:false,
                message:res.error.issues[0].message
            })
        }
        let data = res.data
        let sub= await subServices.editSub(decoded.id,data.title,data.price,data.next,id)

        return NextResponse.json({
            success:true,
            sub
        })
    } catch (error) {
        return NextResponse.json({
            success:false,
            message:error.message || "Internal Server Error"
        },{status:500})
    }
}


export async function DELETE(req,{params}){
    try {
        let {id}= await params
        let token= req.headers.get("authorization")
        if(!token || !token.startsWith("Bearer ")){
            return NextResponse.json({
                success:false,
                message:"Unauthenticated"
            },{status:401})
        }
        token=token.split(" ")[1]
        let decoded=verifyToken(token)
        if(!decoded){
            return NextResponse.json({
                success:false,
                message:"Invalid Token"
            },{status:401})
        }
        let sub= await subServices.deleteSub(decoded.id,id)

        return NextResponse.json({
            success:true,
            sub
        })
    } catch (error) {
        return NextResponse.json({
            success:false,
            message:error.message || "Internal Server Error"
        },{status:500})
    }
}