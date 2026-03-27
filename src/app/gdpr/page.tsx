'use client';

import { Btn } from '@/components/ui/btn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function GDPRPage() {
  const router = useRouter();

  return (
    <div className='max-w-3xl mx-auto py-10 px-4 space-y-6 mb-20 md:mb-0'>
      <h1 className='text-3xl font-bold'>GDPR-information</h1>

      {/* 1 */}
      <Card>
        <CardHeader>
          <CardTitle>1. Personuppgifter vi samlar in</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            <strong>Person A (användare):</strong> namn och e-post
          </p>
          <p>
            <strong>Person B (kontaktperson):</strong> namn och e-post (läggs
            till av användaren)
          </p>
        </CardContent>
      </Card>

      {/* 2 */}
      <Card>
        <CardHeader>
          <CardTitle>2. Syfte med databehandling</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            <strong>Person A:</strong> för inloggning och appens funktionalitet
          </p>
          <p>
            <strong>Person B:</strong> används{' '}
            <strong>endast för visning i appen </strong>
            för den användare som lagt till kontakten
          </p>
          <p>Ingen annan användning eller delning sker</p>
        </CardContent>
      </Card>

      {/* 3 */}
      <Card>
        <CardHeader>
          <CardTitle>3. Google Analytics 4</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            Vi samlar in anonymiserad statistik om hur appen används (t.ex.
            sidvisningar och klick)
          </p>
          <p>Syftet är att förbättra appen och användarupplevelsen</p>
          <p>Ingen information om kontaktpersoner används i analysen</p>
        </CardContent>
      </Card>

      {/* 4 */}
      <Card>
        <CardHeader>
          <CardTitle>4. Laglig grund</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            <strong>Person A:</strong> samtycke vid registrering
          </p>
          <p>
            <strong>Person B:</strong> berättigat intresse, då uppgifterna
            endast används för appens funktion
          </p>
        </CardContent>
      </Card>

      {/* 5 */}
      <Card>
        <CardHeader>
          <CardTitle>5. Dina rättigheter</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>Du har rätt att:</p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>Få tillgång till dina uppgifter</li>
            <li>Få felaktiga uppgifter rättade</li>
            <li>Få dina uppgifter raderade</li>
          </ul>
          <p>
            Kontakta oss på: <strong>[vi-svarar-aldrig@jobish.se]</strong>
          </p>
        </CardContent>
      </Card>

      {/* 6 */}
      <Card>
        <CardHeader>
          <CardTitle>6. Säkerhet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Vi skyddar dina uppgifter genom tekniska och organisatoriska
            säkerhetsåtgärder för att förhindra obehörig åtkomst.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// En popup dialog med kortfattad GDPR-information om någon av koden behövs i framtiden

// "use client"

// import * as React from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"

// export default function GDPRPopup() {
//   const [open, setOpen] = React.useState(true)

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>GDPR-information</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 mt-2">
//           <p>
//             När du använder appen sparas ditt namn och e-post
//             för att appen ska fungera.
//           </p>
//           <p>
//             Du kan också lägga till kontaktpersoner. Denna information används
//             endast för att visas för dig i appen och delas inte med någon annan.
//           </p>
//           <p>
//             Vi använder Google Analytics 4 för anonym statistik om appanvändning.
//             Ingen personlig information om kontaktpersoner används i analysen.
//           </p>
//         </div>

//         <DialogFooter className="pt-4 flex justify-end">
//           <Button onClick={() => setOpen(false)}>Acceptera</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
