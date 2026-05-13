import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  const dateStr = query.date as string

  // Option 1: Delete by specific attendance ID
  if (id) {
    return await prisma.attendance.delete({
      where: { id: parseInt(id) }
    })
  }

  // Option 2: Delete all records for a specific date
  if (dateStr) {
    const startOfDay = new Date(dateStr)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateStr)
    endOfDay.setHours(23, 59, 59, 999)

    return await prisma.attendance.deleteMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'ID or Date is required for deletion',
  })
})
