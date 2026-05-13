import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  return await prisma.member.findMany({
    include: {
      weapons: true,
    },
    orderBy: { createdAt: 'desc' },
  })
})
