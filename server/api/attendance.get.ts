import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const dateStr = query.date as string // Expected YYYY-MM-DD

  if (!dateStr) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Date is required',
    })
  }

  // Find attendance for this date
  const startOfDay = new Date(dateStr)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(dateStr)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      member: {
        include: {
          weapons: true,
        },
      },
    },

  })
})
