import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Weapon name is required',
    })
  }

  return await prisma.weaponType.upsert({
    where: { name },
    update: {},
    create: { name },
  })
})
