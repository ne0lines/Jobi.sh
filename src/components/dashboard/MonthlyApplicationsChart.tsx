"use client";

import dynamic from "next/dynamic";

import { JobStatus } from "@/app/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type MonthlyApplicationsChartProps = {
  applications: Array<{
    id: string
    status: JobStatus
    timeline: Array<{
      date: string
      event: string
    }>
  }>
}

export function MonthlyApplicationsChart({
  applications,
}: Readonly<MonthlyApplicationsChartProps>) {
  // Find the earliest application date
  const earliestDate =
    applications.length > 0
      ? new Date(
          Math.min(
            ...applications
              .filter((app) => app.timeline.length > 0)
              .map((app) => new Date(app.timeline[0].date).getTime()),
          ),
        )
      : new Date()

  const now = new Date()
  const months = []
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

  // Generate months from earliest application to current month (max 7 months)
  const startMonth = new Date(
    earliestDate.getFullYear(),
    earliestDate.getMonth(),
    1,
  )
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const totalMonths = Math.ceil(
    (endMonth.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24 * 30),
  )
  const displayMonths = Math.min(totalMonths + 1, 7)

  // Start from the most recent months if there are more than 7
  const actualStartMonth =
    totalMonths >= 7
      ? new Date(now.getFullYear(), now.getMonth() - 6, 1)
      : startMonth

  for (let i = 0; i < displayMonths; i++) {
    months.push(
      new Date(
        actualStartMonth.getFullYear(),
        actualStartMonth.getMonth() + i,
        1,
      ),
    )
  }

  // Calculate applications per month (based on first timeline entry)
  const applicationsData = months.map((month) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    return applications.filter((app) => {
      if (!app.timeline.length) return false
      const appDate = new Date(app.timeline[0].date)
      return appDate >= start && appDate < end
    }).length
  })

  // Calculate interviews per month (applications that reached interview status)
  const interviewsData = months.map((month) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    return applications.filter((app) => {
      if (!app.timeline.length) return false
      // Check if any timeline event in this month indicates an interview
      return (
        app.timeline.some((event) => {
          const eventDate = new Date(event.date)
          return (
            eventDate >= start &&
            eventDate < end &&
            event.event.toLowerCase().includes('intervju')
          )
        }) ||
        (app.status === JobStatus.INTERVIEW &&
          new Date(app.timeline[0].date) <= end)
      )
    }).length
  })

  const chartOptions = {
    chart: {
      type: 'area' as const,
      height: 190,
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    colors: ['#7f43ff', '#10b981'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: months.map((month) => monthNames[month.getMonth()]),
      tickPlacement: 'on' as const,
      labels: {
        offsetX: -3,
        style: {
          cssClass: 'monthly-chart-xaxis-label',
          colors: '#64748b',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: false,
      floating: true,
      labels: {
        align: 'left' as const,
        maxWidth: 24,
        minWidth: 0,
        offsetX: 0,
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        formatter: (value: number) => Math.round(value).toString(),
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    grid: {
      show: false,
      padding: {
        top: 0,
        right: 0,
        bottom: -8,
        left: 0,
      },
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      labels: {
        colors: '#64748b',
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
  }

  const series = [
    {
      name: 'Ansökningar',
      data: applicationsData,
    },
    {
      name: 'Intervjuer',
      data: interviewsData,
    },
  ]

  return (
    <article className='monthly-applications-chart w-full min-w-0 rounded-2xl border border-app-stroke bg-app-card px-4'>
      <div className='w-[calc(100%+1rem)] min-w-0'>
        <ReactApexChart
          options={chartOptions}
          series={series}
          type='area'
          height={210}
          width='100%'
        />
      </div>
    </article>
  )
}
