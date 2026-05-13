import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  console.log('Deleting weapon type ID:', id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  try {
    return await prisma.weaponType.delete({
      where: { id },
    })
  } catch (error: any) {
    console.error('Delete weapon error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    })
  }
})

