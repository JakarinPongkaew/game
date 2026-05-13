import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  return await prisma.weaponType.findMany({
    orderBy: { name: 'asc' },
  })
})
