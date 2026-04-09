import Link from 'next/link';
import { Btn } from '@/components/ui/btn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GDPRPage() {
  return (
    <div className='max-w-3xl mx-auto py-10 px-4 space-y-6 mb-20 md:mb-0'>
      <h1 className='text-3xl font-bold'>GDPR-information</h1>
      <p className='text-base leading-7 text-app-muted'>
        Detta är en kort sammanfattning av hur Jobi.sh behandlar personuppgifter.
        Den fullständiga beskrivningen finns i vår{' '}
        <Link
          className='font-semibold text-app-primary underline underline-offset-2'
          href='/privacy'
        >
          integritetspolicy
        </Link>
        .
      </p>

      {/* 1 */}
      <Card>
        <CardHeader>
          <CardTitle>1. Personuppgifter vi samlar in</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            Vi behandlar uppgifter om dig som användare, till exempel e-post,
            namn, yrke, användar-ID och information om att du godkänt gällande
            villkor.
          </p>
          <p>
            Vi behandlar också det innehåll du själv sparar i appen, till exempel
            jobb, anteckningar, uppgifter, datum och kontaktpersoner med namn,
            roll, e-post och telefonnummer.
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
            Uppgifterna används för inloggning, kontohantering och för att ge dig
            appens funktioner för att organisera jobbansökningar och
            aktivitetsrapportering.
          </p>
          <p>
            Vi använder också vissa uppgifter för drift, säkerhet, felsökning,
            produktförbättring och för att förhindra missbruk.
          </p>
          <p>
            Laglig grund är främst avtal när vi levererar tjänsten till dig och
            berättigat intresse för drift, säkerhet och förbättring av tjänsten.
          </p>
        </CardContent>
      </Card>

      {/* 3 */}
      <Card>
        <CardHeader>
          <CardTitle>3. Anonym användningsstatistik</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            Vi använder PostHog för anonym användningsstatistik. Tjänsten är
            konfigurerad utan personprofiler, utan spårningscookies och utan
            beständig identifiering mellan sessioner.
          </p>
          <p>
            Vi använder också Sentry för felövervakning och prestandadata.
            Textinnehåll och media maskeras i sessionsåterspelning, och
            standard-PII skickas inte.
          </p>
          <p>
            Cookies används för inloggning och sessionshantering, inte för
            marknadsföringsspårning.
          </p>
        </CardContent>
      </Card>

      {/* 4 */}
      <Card>
        <CardHeader>
          <CardTitle>4. Felspårning och felsökning</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            Vi delar inte dina personuppgifter genom försäljning. Uppgifter delas
            endast med leverantörer som behövs för att driva tjänsten, till
            exempel för autentisering, analys och felövervakning.
          </p>
          <p>
            Exempel på sådana leverantörer är Clerk, PostHog och Sentry. Om
            behandling sker utanför EU/EES ska lämpliga skyddsåtgärder användas.
          </p>
        </CardContent>
      </Card>

      {/* 5 */}
      <Card>
        <CardHeader>
          <CardTitle>5. Laglig grund</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            Vi sparar uppgifter så länge ditt konto är aktivt eller så länge de
            behövs för att leverera tjänsten.
          </p>
          <p>
            Tekniska loggar och analysdata sparas normalt kortare tid och gallras
            när de inte längre behövs. Uppgifter kan sparas längre om lagen kräver
            det eller om det behövs för att hantera tvister eller säkerhetsärenden.
          </p>
        </CardContent>
      </Card>

      {/* 6 */}
      <Card>
        <CardHeader>
          <CardTitle>6. Dina rättigheter</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>Du har rätt att:</p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>Få tillgång till dina uppgifter</li>
            <li>Få felaktiga uppgifter rättade</li>
            <li>Få dina uppgifter raderade</li>
            <li>Invända mot viss behandling eller begära begränsning</li>
            <li>Få ut uppgifter i ett portabelt format där lagen ger rätt till det</li>
          </ul>
          <p>
            Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY).
          </p>
          <p>
            För kontakt och fullständig information, se{' '}
            <Link
              className='font-semibold text-app-primary underline underline-offset-2'
              href='/privacy'
            >
              integritetspolicyn
            </Link>
            {' '}eller mejla jobbi.sh@proton.me.
          </p>
        </CardContent>
      </Card>

      {/* 7 */}
      <Card>
        <CardHeader>
          <CardTitle>7. Säkerhet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Vi skyddar dina uppgifter genom tekniska och organisatoriska
            säkerhetsåtgärder för att förhindra obehörig åtkomst.
          </p>
        </CardContent>
      </Card>

      <div className='flex justify-start'>
        <Btn href='/privacy' variant='secondary'>
          Läs fullständig integritetspolicy
        </Btn>
      </div>
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
