import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  return await prisma.member.delete({
    where: { id },
  })
})
