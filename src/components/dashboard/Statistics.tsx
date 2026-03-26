import { JobStatus } from '@/app/types'
import { MonthlyApplicationsChart } from './MonthlyApplicationsChart'

type StatisticsProps = {
  applications: Array<{
    id: string
    status: JobStatus
    timeline: Array<{
      date: string
      event: string
    }>
  }>
}

export function Statistics({ applications }: StatisticsProps) {
  const totalApplications = applications.length
  const interviews = applications.filter(
    (job) => job.status === JobStatus.INTERVIEW,
  ).length
  const offers = applications.filter(
    (job) => job.status === JobStatus.OFFER,
  ).length
  const closed = applications.filter(
    (job) => job.status === JobStatus.CLOSED,
  ).length
  const successRate =
    totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0

  // Calculate monthly applications
  const now = new Date()
  const months = []
  for (let i = 6; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
  }
  const monthlyCounts = months.map((month) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    return applications.filter((app) => {
      if (!app.timeline.length) return false
      const appDate = new Date(app.timeline[0].date)
      return appDate >= start && appDate < end
    }).length
  })
  const maxCount = Math.max(...monthlyCounts, 1)
  const points = monthlyCounts.map((count, index) => {
    const x = (index / 6) * 336
    const y = 190 - (count / maxCount) * 140 - 20
    return { x, y }
  })

  // Function to generate smooth path using cubic Bézier curves
  const generateSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length < 2) return ''
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
    }
    return path
  }

  const pathData = generateSmoothPath(points)
  const areaPathData = pathData + ' L 336 190 L 0 190 Z'
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec',
  ]

  return (
    <section className='w-full'>
      <h2 className='mt-6 mb-3 font-display text-3xl md:text-[1.75rem]'>Statistik</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3 h-fit'>
          <article className='rounded-2xl bg-slate-200 p-3'>
            <strong className='block font-display text-4xl leading-none'>
              {totalApplications}
            </strong>
            <span className='text-base text-app-muted text-sm'>Ansökningar</span>
          </article>
          <article className='rounded-2xl bg-app-cyan p-3 text-app-cyan-strong'>
            <strong className='block font-display text-4xl leading-none'>
              {interviews}
            </strong>
            <span className='text-base text-app-muted text-sm'>Intervjuer</span>
          </article>
          <article className='rounded-2xl bg-app-green p-3 text-app-green-strong'>
            <strong className='block font-display text-4xl leading-none'>
              {offers}
            </strong>
            <span className='text-base text-app-muted text-sm'>Jobberbjudanden</span>
          </article>
          <article className='rounded-2xl bg-red-200 p-3 text-red-700'>
            <strong className='block font-display text-4xl leading-none'>
              {closed}
            </strong>
            <span className='text-base text-app-muted text-sm'>Avslutade</span>
          </article>

          {/*
          <article className='rounded-2xl bg-app-sand p-5 text-app-sand-strong col-span-2'>
            <strong className='block font-display text-4xl leading-none'>
              {successRate}%
            </strong>
            <span className='text-base text-app-muted'>Framgång</span>
          </article>
          */}
        </div>
        <MonthlyApplicationsChart applications={applications} />
      </div>
    </section>
  )
}
