import { JobStatus } from '@/app/types'
import { cn } from '@/lib/utils'
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

export function Statistics({ applications }: Readonly<StatisticsProps>) {
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

  const statCards = [
    {
      label: 'Ansökningar',
      value: totalApplications,
      cardClassName: 'bg-app-surface text-app-ink dark:bg-app-card',
      valueClassName: 'text-app-ink',
    },
    {
      label: 'Intervjuer',
      value: interviews,
      cardClassName:
        'bg-app-cyan text-app-cyan-strong dark:bg-[#123348] dark:text-[#8edcff]',
      valueClassName: 'text-app-cyan-strong dark:text-[#8edcff]',
    },
    {
      label: 'Jobberbjudanden',
      value: offers,
      cardClassName:
        'bg-app-green text-app-green-strong dark:bg-[#143325] dark:text-[#7ee0a7]',
      valueClassName: 'text-app-green-strong dark:text-[#7ee0a7]',
    },
    {
      label: 'Avslutade',
      value: closed,
      cardClassName:
        'bg-app-blush text-app-red-strong dark:bg-[#3d2823] dark:text-[#ff9395]',
      valueClassName: 'text-app-red-strong dark:text-[#ff9395]',
    },
  ] as const

  return (
    <section className='w-full'>
      <h2 className='mt-6 mb-3 font-display text-3xl md:text-[1.75rem]'>Statistik</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3 h-fit'>
          {statCards.map(({ cardClassName, label, value, valueClassName }) => (
            <article
              key={label}
              className={cn(
                'rounded-2xl p-3 transition-colors',
                cardClassName,
              )}
            >
              <strong
                className={cn(
                  'block font-display text-4xl leading-none',
                  valueClassName,
                )}
              >
                {value}
              </strong>
              <span className='mt-2 block text-sm text-app-muted'>{label}</span>
            </article>
          ))}
        </div>
        <MonthlyApplicationsChart applications={applications} />
      </div>
    </section>
  )
}
