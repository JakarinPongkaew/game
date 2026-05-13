import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)
  const { name, weapons } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  // Update member and their weapons
  // We first delete all existing weapons for this member and recreate them
  return await prisma.member.update({
    where: { id },
    data: {
      name,
      weapons: {
        deleteMany: {},
        create: weapons.map((w: any) => ({
          weaponType: w.weaponType,
          level: parseInt(w.level) || 1,
        })),
      },
    },
    include: {
      weapons: true,
    },
  })
})
