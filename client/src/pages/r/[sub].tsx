import { useRouter } from 'next/router'

export default function Sub() {
  const router = useRouter();

  return (
    <div className="pt-12">
      sub name
    </div>
  )
}
