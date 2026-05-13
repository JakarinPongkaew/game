import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Testing Database Connection ---')
  try {
    const userCount = await prisma.user.count()
    console.log(`Successfully connected! Found ${userCount} users in database.`)
    
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (admin) {
      console.log('Admin user found: YES')
    } else {
      console.log('Admin user found: NO (Need to seed)')
    }
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
