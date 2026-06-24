import User from "@/app/services/db/models/user"
import connectDB from "./db/connectDb"
import { generateRefreshToken,generateToken,verifyRefreshToken,verifyToken } from "./jwt"
import bcrypt from 'bcrypt'


let authServices={
    /**
     * إنشاء حساب مستخدم جديد
     * @param {string} username - اسم المستخدم الجديد
     * @param {string} email - البريد الإلكتروني للمستخدم
     * @param {string} password - كلمة المرور (غير مشفرة)
     * @returns {Promise<AuthResponse>} كائن يحتوي على حالة العملية وبيانات المستخدم والتوكنز
     */
    register:async({username,email,password})=>{
        await connectDB()
        let ifFound= await User.findOne({email})
        if(ifFound) return {success:false,message:"Email already in use"}
        let hashedPassword=await bcrypt.hash(String(password),10)
        let user={
            username,
            email,
            password:hashedPassword
        }

        let newUser=await User.create(user)
        let token= generateToken({ id: newUser._id })
        let refreshToken= generateRefreshToken({ id: newUser._id })
        let sendUser={
            username:newUser.username,
            email:newUser.email
        }
        return {success:true,user:sendUser, token,refreshToken}
    },
    /**
     * تسجيل دخول مستخدم موجود بالفعل
     * @param {string} email - البريد الإلكتروني للمستخدم
     * @param {string} password - كلمة المرور المدخلة
     * @returns {Promise<AuthResponse>} كائن يحتوي على حالة العملية وبيانات المستخدم والتوكنز
     */
    login:async (email,password)=>{
        await connectDB()
        let user=await User.findOne({email}).select("+password")
        if(!user) return {success:false,message:"User not Found"}
        let comparedPassword= await bcrypt.compare(password,user.password)
        if(!comparedPassword) return {success:false,message:"Incorrect Password"}
        let token= generateToken(user)
        let refreshToken= generateRefreshToken(user)
        let sendUser={
            username:user.username,
            email:user.email,
        }
        return {success:true,user:sendUser,token,refreshToken}
    },
    
}

export default authServices