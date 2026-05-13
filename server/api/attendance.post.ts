import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date, records } = body // records: [{ memberId: number, status: string }]

  if (!date || !records || !Array.isArray(records)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Date and records array are required',
    })
  }

  const baseDate = new Date(date)
  baseDate.setHours(12, 0, 0, 0) // Normalize to noon to avoid timezone issues

  // We use a transaction to update all records
  const operations = records.map((record) => {
    return prisma.attendance.upsert({
      where: {
        memberId_date: {
          memberId: record.memberId,
          date: baseDate,
        },
      },
      update: {
        status: record.status,
      },
      create: {
        memberId: record.memberId,
        date: baseDate,
        status: record.status,
      },
    })
  })

  return await prisma.$transaction(operations)
})
