// app/page.tsx (or .jsx)
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
