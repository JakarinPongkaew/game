import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, weapons } = body

  if (!name || !weapons || !Array.isArray(weapons)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and Weapons array are required',
    })
  }

  return await prisma.member.create({
    data: {
      name,
      weapons: {
        create: weapons.map((w: any) => ({
          weaponType: w.weaponType,
          level: parseInt(w.level) || 1,
        }))
      }
    },
    include: {
      weapons: true
    }
  })
})
