import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Clearing existing data...');
  await prisma.reportActivity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.disasterReport.deleteMany();
  await prisma.roadReport.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('👥 Creating users...');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '081234567890',
      role: 'admin',
      isActive: true,
    },
  });

  const petugas1 = await prisma.user.create({
    data: {
      name: 'Petugas Satu',
      email: 'petugas1@example.com',
      password: hashedPassword,
      phone: '081234567891',
      role: 'petugas',
      isActive: true,
    },
  });

  const petugas2 = await prisma.user.create({
    data: {
      name: 'Petugas Dua',
      email: 'petugas2@example.com',
      password: hashedPassword,
      phone: '081234567892',
      role: 'petugas',
      isActive: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '081234567893',
      role: 'user',
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      phone: '081234567894',
      role: 'user',
      isActive: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: hashedPassword,
      phone: '081234567895',
      role: 'user',
      isActive: true,
    },
  });

  console.log(`✅ Created ${6} users`);

  // ============================================
  // CREATE DISASTER REPORTS
  // ============================================
  console.log('🌊 Creating disaster reports...');

  const disaster1 = await prisma.disasterReport.create({
    data: {
      type: 'flood',
      title: 'Banjir di Jalan Raya Sudirman',
      description:
        'Banjir terjadi akibat hujan deras yang berlangsung selama 3 jam. Air mencapai ketinggian 50cm dan menggenangi beberapa rumah.',
      address: 'Jalan Jenderal Sudirman No. 123, Jakarta Pusat',
      lat: -6.2088,
      lng: 106.8456,
      district: 'Jakarta Pusat',
      status: 'verified',
      riskLevel: 'high',
      urgencyPercentage: 75,
      reportedById: user1.id,
      assignedToId: petugas1.id,
      handledBy: petugas1.id,
      notes: 'Tim petugas sedang menuju lokasi untuk evakuasi warga.',
      images: [],
    },
  });

  const disaster2 = await prisma.disasterReport.create({
    data: {
      type: 'fire',
      title: 'Kebakaran di Pasar Tradisional',
      description:
        'Kebakaran terjadi di pasar tradisional akibat korsleting listrik. Api sudah mulai menyebar ke beberapa kios.',
      address: 'Pasar Senen, Jakarta Pusat',
      lat: -6.1751,
      lng: 106.865,
      district: 'Jakarta Pusat',
      status: 'in_progress',
      riskLevel: 'critical',
      urgencyPercentage: 90,
      reportedById: user2.id,
      assignedToId: petugas1.id,
      handledBy: petugas1.id,
      notes:
        'Tim pemadam kebakaran sedang dalam perjalanan. Warga di sekitar lokasi diminta untuk mengungsi.',
      images: [],
    },
  });

  const disaster3 = await prisma.disasterReport.create({
    data: {
      type: 'fallen_tree',
      title: 'Pohon Tumbang Menutupi Jalan',
      description:
        'Pohon besar tumbang akibat angin kencang dan menutupi jalan raya. Lalu lintas terhambat.',
      address: 'Jalan Gatot Subroto, Jakarta Selatan',
      lat: -6.2297,
      lng: 106.8003,
      district: 'Jakarta Selatan',
      status: 'pending',
      riskLevel: 'medium',
      urgencyPercentage: 50,
      reportedById: user3.id,
      images: [],
    },
  });

  const disaster4 = await prisma.disasterReport.create({
    data: {
      type: 'flood',
      title: 'Banjir Bandang di Perumahan',
      description:
        'Banjir bandang terjadi di kompleks perumahan akibat saluran drainase yang tersumbat.',
      address: 'Perumahan Taman Indah, Jakarta Barat',
      lat: -6.1944,
      lng: 106.8229,
      district: 'Jakarta Barat',
      status: 'resolved',
      riskLevel: 'low',
      urgencyPercentage: 20,
      reportedById: user1.id,
      assignedToId: petugas2.id,
      handledBy: petugas2.id,
      notes: 'Masalah sudah ditangani. Saluran drainase sudah dibersihkan dan air sudah surut.',
      images: [],
    },
  });

  const disaster5 = await prisma.disasterReport.create({
    data: {
      type: 'earthquake',
      title: 'Gempa Ringan di Jakarta',
      description:
        'Terjadi gempa ringan dengan skala 4.5 SR. Beberapa bangunan mengalami retakan ringan.',
      address: 'Jakarta Selatan',
      lat: -6.2297,
      lng: 106.8003,
      district: 'Jakarta Selatan',
      status: 'verified',
      riskLevel: 'medium',
      urgencyPercentage: 60,
      reporterName: 'Anonymous Reporter',
      reporterPhone: '081234567999',
      assignedToId: petugas2.id,
      images: [],
    },
  });

  console.log(`✅ Created ${5} disaster reports`);

  // ============================================
  // CREATE ROAD REPORTS
  // ============================================
  console.log('🛣️  Creating road reports...');

  const road1 = await prisma.roadReport.create({
    data: {
      type: 'pothole',
      title: 'Lubang Besar di Jalan Raya',
      description:
        'Lubang besar dengan diameter sekitar 1 meter dan kedalaman 30cm di tengah jalan. Sangat berbahaya untuk kendaraan.',
      address: 'Jalan Thamrin, Jakarta Pusat',
      lat: -6.1944,
      lng: 106.8229,
      district: 'Jakarta Pusat',
      status: 'verified',
      dangerLevel: 'severe',
      urgencyPercentage: 70,
      reportedById: user1.id,
      assignedToId: petugas1.id,
      aiDetectedIssues: ['pothole_detected'],
      aiConfidence: 0.95,
      aiRecommendedAction: 'Perbaikan segera diperlukan',
      images: [],
    },
  });

  const road2 = await prisma.roadReport.create({
    data: {
      type: 'crack',
      title: 'Retakan Panjang di Jalan',
      description:
        'Retakan panjang sekitar 50 meter di sisi kiri jalan. Perlu perbaikan sebelum memburuk.',
      address: 'Jalan Rasuna Said, Jakarta Selatan',
      lat: -6.2297,
      lng: 106.8003,
      district: 'Jakarta Selatan',
      status: 'in_progress',
      dangerLevel: 'moderate',
      urgencyPercentage: 55,
      reportedById: user2.id,
      assignedToId: petugas2.id,
      images: [],
    },
  });

  const road3 = await prisma.roadReport.create({
    data: {
      type: 'flooding',
      title: 'Genangan Air di Jalan',
      description: 'Genangan air setinggi 20cm di jalan akibat hujan. Menghambat lalu lintas.',
      address: 'Jalan Kemang Raya, Jakarta Selatan',
      lat: -6.2603,
      lng: 106.8086,
      district: 'Jakarta Selatan',
      status: 'pending',
      dangerLevel: 'minor',
      urgencyPercentage: 40,
      reportedById: user3.id,
      images: [],
    },
  });

  const road4 = await prisma.roadReport.create({
    data: {
      type: 'pothole',
      title: 'Banyak Lubang Kecil di Jalan',
      description: 'Banyak lubang kecil di sepanjang jalan. Perlu perbaikan menyeluruh.',
      address: 'Jalan Cikini Raya, Jakarta Pusat',
      lat: -6.1944,
      lng: 106.8358,
      district: 'Jakarta Pusat',
      status: 'resolved',
      dangerLevel: 'minor',
      urgencyPercentage: 15,
      reportedById: user1.id,
      assignedToId: petugas1.id,
      images: [],
    },
  });

  const road5 = await prisma.roadReport.create({
    data: {
      type: 'bridge_damage',
      title: 'Kerusakan pada Jembatan',
      description:
        'Ditemukan retakan pada struktur jembatan. Perlu inspeksi lebih lanjut oleh ahli struktur.',
      address: 'Jembatan Cawang, Jakarta Timur',
      lat: -6.2444,
      lng: 106.8769,
      district: 'Jakarta Timur',
      status: 'verified',
      dangerLevel: 'severe',
      urgencyPercentage: 85,
      reporterName: 'Anonymous Reporter',
      reporterPhone: '081234567888',
      assignedToId: petugas2.id,
      images: [],
    },
  });

  console.log(`✅ Created ${5} road reports`);

  // ============================================
  // CREATE COMMENTS
  // ============================================
  console.log('💬 Creating comments...');

  await prisma.comment.create({
    data: {
      reportId: disaster1.id,
      reportType: 'disaster',
      content:
        'Saya juga melihat banjir di lokasi tersebut. Air sudah mulai surut sekitar 30 menit yang lalu.',
      authorId: user2.id,
      disasterReportId: disaster1.id,
    },
  });

  await prisma.comment.create({
    data: {
      reportId: disaster1.id,
      reportType: 'disaster',
      content: 'Terima kasih atas laporannya. Tim kami sedang menuju lokasi.',
      authorId: petugas1.id,
      disasterReportId: disaster1.id,
    },
  });

  await prisma.comment.create({
    data: {
      reportId: disaster2.id,
      reportType: 'disaster',
      content:
        'Api sudah berhasil dipadamkan. Tidak ada korban jiwa, hanya beberapa kios yang terbakar.',
      authorId: petugas1.id,
      disasterReportId: disaster2.id,
    },
  });

  await prisma.comment.create({
    data: {
      reportId: road1.id,
      reportType: 'road',
      content:
        'Lubang ini sangat berbahaya, saya hampir kecelakaan kemarin. Harap segera diperbaiki.',
      authorId: user3.id,
      roadReportId: road1.id,
    },
  });

  await prisma.comment.create({
    data: {
      reportId: road1.id,
      reportType: 'road',
      content: 'Perbaikan akan dilakukan besok pagi. Terima kasih atas laporannya.',
      authorId: petugas1.id,
      roadReportId: road1.id,
    },
  });

  await prisma.comment.create({
    data: {
      reportId: road2.id,
      reportType: 'road',
      content: 'Retakan ini sudah ada sejak seminggu yang lalu. Semoga segera diperbaiki.',
      authorId: user1.id,
      roadReportId: road2.id,
    },
  });

  console.log(`✅ Created ${6} comments`);

  // ============================================
  // CREATE ACTIVITIES
  // ============================================
  console.log('📋 Creating activities...');

  // Activities for disaster1
  await prisma.reportActivity.create({
    data: {
      reportId: disaster1.id,
      reportType: 'disaster',
      activityType: 'assigned',
      description: `Laporan ditugaskan kepada ${petugas1.name}`,
      createdById: admin.id,
      disasterReportId: disaster1.id,
      metadata: {
        assignedTo: petugas1.name,
        assignedToId: petugas1.id,
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: disaster1.id,
      reportType: 'disaster',
      activityType: 'status_changed',
      description: 'Status laporan diubah menjadi verified',
      createdById: petugas1.id,
      disasterReportId: disaster1.id,
      metadata: {
        oldStatus: 'pending',
        newStatus: 'verified',
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: disaster1.id,
      reportType: 'disaster',
      activityType: 'note_added',
      description: 'Tim petugas sedang menuju lokasi untuk evakuasi warga.',
      createdById: petugas1.id,
      disasterReportId: disaster1.id,
      metadata: {
        note: 'Tim petugas sedang menuju lokasi untuk evakuasi warga.',
      },
      images: [],
    },
  });

  // Activities for disaster2
  await prisma.reportActivity.create({
    data: {
      reportId: disaster2.id,
      reportType: 'disaster',
      activityType: 'assigned',
      description: `Laporan ditugaskan kepada ${petugas1.name}`,
      createdById: admin.id,
      disasterReportId: disaster2.id,
      metadata: {
        assignedTo: petugas1.name,
        assignedToId: petugas1.id,
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: disaster2.id,
      reportType: 'disaster',
      activityType: 'status_changed',
      description: 'Status laporan diubah menjadi in_progress',
      createdById: petugas1.id,
      disasterReportId: disaster2.id,
      metadata: {
        oldStatus: 'pending',
        newStatus: 'in_progress',
      },
      images: [],
    },
  });

  // Activities for disaster4 (resolved)
  await prisma.reportActivity.create({
    data: {
      reportId: disaster4.id,
      reportType: 'disaster',
      activityType: 'assigned',
      description: `Laporan ditugaskan kepada ${petugas2.name}`,
      createdById: admin.id,
      disasterReportId: disaster4.id,
      metadata: {
        assignedTo: petugas2.name,
        assignedToId: petugas2.id,
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: disaster4.id,
      reportType: 'disaster',
      activityType: 'resolved',
      description:
        'Masalah sudah ditangani. Saluran drainase sudah dibersihkan dan air sudah surut.',
      createdById: petugas2.id,
      disasterReportId: disaster4.id,
      metadata: {
        resolution: 'Saluran drainase sudah dibersihkan dan air sudah surut.',
      },
      images: [],
    },
  });

  // Activities for road1
  await prisma.reportActivity.create({
    data: {
      reportId: road1.id,
      reportType: 'road',
      activityType: 'assigned',
      description: `Laporan ditugaskan kepada ${petugas1.name}`,
      createdById: admin.id,
      roadReportId: road1.id,
      metadata: {
        assignedTo: petugas1.name,
        assignedToId: petugas1.id,
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: road1.id,
      reportType: 'road',
      activityType: 'verified',
      description: 'Laporan telah diverifikasi. Lubang dikonfirmasi berbahaya.',
      createdById: petugas1.id,
      roadReportId: road1.id,
      metadata: {
        verification: 'Lubang dikonfirmasi berbahaya dan perlu perbaikan segera.',
      },
      images: [],
    },
  });

  // Activities for road2
  await prisma.reportActivity.create({
    data: {
      reportId: road2.id,
      reportType: 'road',
      activityType: 'assigned',
      description: `Laporan ditugaskan kepada ${petugas2.name}`,
      createdById: admin.id,
      roadReportId: road2.id,
      metadata: {
        assignedTo: petugas2.name,
        assignedToId: petugas2.id,
      },
      images: [],
    },
  });

  await prisma.reportActivity.create({
    data: {
      reportId: road2.id,
      reportType: 'road',
      activityType: 'status_changed',
      description: 'Status laporan diubah menjadi in_progress',
      createdById: petugas2.id,
      roadReportId: road2.id,
      metadata: {
        oldStatus: 'pending',
        newStatus: 'in_progress',
      },
      images: [],
    },
  });

  // Activities for road4 (resolved)
  await prisma.reportActivity.create({
    data: {
      reportId: road4.id,
      reportType: 'road',
      activityType: 'resolved',
      description: 'Semua lubang sudah diperbaiki dengan aspal hotmix.',
      createdById: petugas1.id,
      roadReportId: road4.id,
      metadata: {
        resolution: 'Semua lubang sudah diperbaiki dengan aspal hotmix.',
      },
      images: [],
    },
  });

  console.log(`✅ Created ${12} activities`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${6} (1 admin, 2 petugas, 3 users)`);
  console.log(`   - Disaster Reports: ${5}`);
  console.log(`   - Road Reports: ${5}`);
  console.log(`   - Comments: ${6}`);
  console.log(`   - Activities: ${12}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: password123');
  console.log('\n   Petugas:');
  console.log('     Email: petugas1@example.com / petugas2@example.com');
  console.log('     Password: password123');
  console.log('\n   User:');
  console.log('     Email: john@example.com / jane@example.com / budi@example.com');
  console.log('     Password: password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
