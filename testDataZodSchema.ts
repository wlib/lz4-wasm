import { z } from "zod"

export const GeoSchema = z.object({
  lat: z.string(),
  lng: z.string()
})
export type Geo = z.infer<typeof GeoSchema>

export const AddressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: GeoSchema
})
export type Address = z.infer<typeof AddressSchema>

export const CompanySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string()
});
export type Company = z.infer<typeof CompanySchema>

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  address: AddressSchema,
  phone: z.string(),
  website: z.string(),
  company: CompanySchema
});
export type User = z.infer<typeof UserSchema>

export const UsersSchema = z.array(UserSchema)
export type Users = z.infer<typeof UsersSchema>
