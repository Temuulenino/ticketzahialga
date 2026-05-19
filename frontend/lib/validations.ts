import { z } from 'zod'

export const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
    last_name: z.string().min(2, 'Овог хамгийн багадаа 2 тэмдэгт байх ёстой'),
    email: z.string().email('Имэйл хаяг буруу байна'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      .regex(/[A-Z]/, 'Нууц үг томоор бичсэн үсэг агуулсан байх ёстой')
      .regex(/[0-9]/, 'Нууц үг тоо агуулсан байх ёстой'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirm_password'],
  })

export const loginSchema = z.object({
  email: z.string().email('Имэйл хаяг буруу байна'),
  password: z.string().min(1, 'Нууц үг оруулна уу'),
})

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'OTP 6 оронтой байх ёстой')
    .regex(/^\d+$/, 'OTP зөвхөн тоо агуулсан байх ёстой'),
})

export const profileSchema = z.object({
  first_name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
  last_name: z.string().min(2, 'Овог хамгийн багадаа 2 тэмдэгт байх ёстой'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Тайлбар 500 тэмдэгтээс хэтрэхгүй байх ёстой').optional(),
})

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Одоогийн нууц үг оруулна уу'),
    new_password: z
      .string()
      .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      .regex(/[A-Z]/, 'Томоор бичсэн үсэг агуулсан байх ёстой')
      .regex(/[0-9]/, 'Тоо агуулсан байх ёстой'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirm_password'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Имэйл хаяг буруу байна'),
})

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'OTP 6 оронтой байх ёстой').regex(/^\d+$/, 'OTP тоон утга байх ёстой'),
    new_password: z
      .string()
      .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      .regex(/[A-Z]/, 'Томоор бичсэн үсэг агуулсан байх ёстой')
      .regex(/[0-9]/, 'Тоо агуулсан байх ёстой'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirm_password'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OTPInput = z.infer<typeof otpSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
