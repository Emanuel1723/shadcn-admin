import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  { name: 'Jan', total: 4 },
  { name: 'Feb', total: 1 },
  { name: 'Mar', total: 2 },
  { name: 'Apr', total: 3 },
  { name: 'May', total: 5 },
  { name: 'Jun', total: 2 },
  { name: 'Jul', total: 3 },
  { name: 'Aug', total: 6 },
  { name: 'Sep', total: 1 },
  { name: 'Oct', total: 4 },
  { name: 'Nov', total: 4 },
  { name: 'Dec', total: 2 },
]

export function Overview() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          /* Eliminamos el formateo de moneda ($) aquí */
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}