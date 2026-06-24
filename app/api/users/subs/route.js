// todo :
// Endpoint to add subs
// endpoint to delete\uptade
// endpoint to get
// imports

import { NextResponse } from "next/server";
import { subSchema } from "@/app/services/validations/sub";
import { verifyToken } from "@/app/services/jwt";
import { subServices } from "@/app/services/subServices";
export async function GET(req){
    try {
        let token= req.headers.get("authorization")
        if(!token || !token.startsWith("Bearer ")){
            return NextResponse.json({
                success:false,
                message:"Unauthenticated"
            })
        }
        token=token.split(" ")[1]
        let decoded=verifyToken(token)
        if(!decoded ){
            return NextResponse.json({
                success:false,
                message:"Invalid Token"
            })
        }
        let {searchParams}= new URL(req.url)
        let limit= parseInt(searchParams.get("limit") )||10
        let skip= parseInt(searchParams.get("skip"))||0
        let subs= await subServices.getSubs(decoded.id,limit,skip)

        return NextResponse.json({
            success:true,
            subs
        })
    } catch (error) {
        return NextResponse.json({
            success:false,
            message:error.message || "Internal Server Error"
        })
    }
}

export async function POST(req){
    try {
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
                message:res.error.issues
            })
        }
        let data = res.data
        let sub= await subServices.addSub(decoded.id,data.title,data.price,data.next)

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