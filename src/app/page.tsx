import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import SectionWrapper from "@/components/SectionWrapper"
import BGimg from "@/app/asset/bgimg.jpg"
import Image from 'next/image'
import BrandImg from "@/app/asset/Logo.jpeg"
import One from "@/app/asset/3.svg"
import Two from "@/app/asset/1.svg"
import E1 from "@/app/asset/epic/1.png"
import E2 from "@/app/asset/epic/2.png"
import E3 from "@/app/asset/epic/3.png"
import E4 from "@/app/asset/epic/4.png"
import E5 from "@/app/asset/epic/5.png"
import E6 from "@/app/asset/epic/6.png"



import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"






const page = () => {


  const features = [
    {
      icon:
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>,
      title: "Best quality",
      desc: "We care about the quality of the product. As a digital product development agency, we believe in beautiful software."
    },
    {
      icon:
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.476V3H8.865C8.3955 3 7.941 3.093 7.5015 3.2775C7.06407 3.46087 6.66854 3.73136 6.339 4.0725C6.01829 4.39483 5.76667 4.77915 5.5995 5.202V5.2035C5.45069 5.60502 5.35097 6.02305 5.3025 6.4485V6.4515C5.25984 6.8816 5.24781 7.31419 5.2665 7.746C5.2845 8.181 5.2935 8.616 5.2935 9.0495C5.2935 9.354 5.2335 9.639 5.118 9.9075V9.909C4.89786 10.433 4.48805 10.8546 3.9705 11.0895C3.70659 11.2048 3.42148 11.2635 3.1335 11.262H3V12.738H3.135C3.4275 12.738 3.705 12.798 3.969 12.9195L3.9705 12.921C4.2375 13.038 4.464 13.197 4.653 13.398L4.656 13.401C4.851 13.596 5.0055 13.8285 5.1165 14.0985L5.118 14.1015C5.235 14.3715 5.2935 14.6535 5.2935 14.9505C5.2935 15.3855 5.2845 15.8205 5.2665 16.254C5.2485 16.698 5.2605 17.1315 5.3025 17.559V17.5605C5.352 17.985 5.451 18.3975 5.598 18.7965V18.798C5.757 19.2075 6.0045 19.584 6.339 19.9275C6.6735 20.2725 7.062 20.538 7.5015 20.7225C7.941 20.907 8.3955 21 8.8665 21H9V19.524H8.865C8.565 19.524 8.2845 19.467 8.0205 19.3515C7.76585 19.2325 7.53389 19.0701 7.335 18.8715C7.14192 18.666 6.98519 18.4291 6.8715 18.171C6.7605 17.901 6.7065 17.616 6.7065 17.3115C6.7065 16.9695 6.711 16.632 6.723 16.3035C6.735 15.9615 6.735 15.6285 6.723 15.306C6.71771 14.9845 6.69015 14.6637 6.6405 14.346C6.59278 14.0326 6.50819 13.726 6.3885 13.4325C6.15504 12.8646 5.77322 12.3698 5.283 12C5.77377 11.6304 6.15612 11.1356 6.39 10.5675C6.51 10.2795 6.5925 9.978 6.642 9.6645C6.6915 9.3495 6.7185 9.03 6.7245 8.7045C6.7365 8.3745 6.7365 8.0415 6.7245 7.7055C6.7125 7.3695 6.7065 7.0305 6.7065 6.6885C6.7039 6.25858 6.82703 5.83727 7.06076 5.47643C7.29448 5.11558 7.6286 4.83093 8.022 4.6575C8.28687 4.53605 8.57512 4.4741 8.8665 4.476H9ZM15 19.524V21H15.135C15.6045 21 16.059 20.907 16.4985 20.7225C16.938 20.538 17.3265 20.2725 17.661 19.9275C17.9955 19.5825 18.243 19.2075 18.4005 18.798V18.7965C18.5505 18.3975 18.648 17.982 18.6975 17.5515V17.5485C18.7395 17.1285 18.7515 16.698 18.7335 16.254C18.7155 15.819 18.7065 15.384 18.7065 14.9505C18.7065 14.646 18.7665 14.361 18.882 14.0925V14.091C19.1019 13.5668 19.5118 13.1452 20.0295 12.9105C20.2935 12.7954 20.5785 12.7367 20.8665 12.738H21V11.262H20.865C20.571 11.262 20.2935 11.202 20.0295 11.0805L20.028 11.079C19.7705 10.968 19.5382 10.8057 19.3455 10.602L19.3425 10.599C19.1443 10.3993 18.9878 10.1622 18.882 9.9015V9.8985C18.7648 9.63083 18.7045 9.34171 18.705 9.0495C18.705 8.6145 18.714 8.1795 18.732 7.746C18.7507 7.3107 18.7387 6.87461 18.696 6.441V6.4395C18.6474 6.01715 18.5482 5.60217 18.4005 5.2035V5.202C18.2329 4.77902 17.9807 4.39469 17.6595 4.0725C17.3299 3.7314 16.9344 3.46091 16.497 3.2775C16.0653 3.09415 15.601 2.99977 15.132 3H15V4.476H15.135C15.435 4.476 15.7155 4.533 15.978 4.6485C16.239 4.7715 16.467 4.9305 16.6635 5.1285C16.854 5.3295 17.0085 5.5635 17.127 5.829C17.238 6.099 17.292 6.384 17.292 6.6885C17.292 7.0305 17.2875 7.3665 17.2755 7.6965C17.2635 8.0385 17.2635 8.3715 17.2755 8.694C17.2815 9.027 17.3085 9.3465 17.358 9.654C17.4075 9.975 17.4915 10.278 17.61 10.5675C17.8439 11.1356 18.2263 11.6303 18.717 12C18.2263 12.3697 17.8439 12.8644 17.61 13.4325C17.4912 13.7227 17.4066 14.0257 17.358 14.3355C17.3085 14.6505 17.2815 14.97 17.2755 15.2955C17.2634 15.6284 17.2634 15.9616 17.2755 16.2945C17.2875 16.6305 17.2935 16.9695 17.2935 17.3115C17.2959 17.7414 17.1727 18.1626 16.939 18.5234C16.7053 18.8842 16.3713 19.1689 15.978 19.3425C15.7131 19.4639 15.4249 19.5259 15.1335 19.524H15Z" fill="currentColor" />
        </svg>,
      title: "Modern technologies",
      desc: "We use the modern and most flexible and secure technologies to build the best products on the internet."
    },
    {
      icon:
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>,
      title: "Advanced security",
      desc: "At Software Security Solutions our mission is to raise the bar by making computer security more accessible."
    }
  ]





  return (
    <main className='reletive'>
      <div className=" h-20 flex items-center justify-center w-full  to-transparent backdrop-blur-md z-50">
        <div className=" w-full  ">
          <div className="max-w-7xl mx-auto flex items-center justify-center lg:justify-between px-5 text-black py-3">
            <div className="relative">
              <Link href="/" className="flex items-center " >
                <Image src={BrandImg} width={1000} height={1000} alt="Brand Logo" className="w-12 rounded-xl border-2 bg-orange-700 p-1" />
                {/* <span className="text-black text-xl font-bold">Epic Hair</span> */}
              </Link>
            </div>
            <div className="hidden lg:block">
              <ul className="flex gap-4 items-center">

                <li>
                  <a href="#" className=" ">Home</a>
                </li>
                <li>
                  <a href="#feature" className=" ">Feature</a>
                </li>
               
                <li>
                  <a href="#faq" >FAQ</a>
                </li>
               
                <li>
                  <Link href="/" >
                    <Button className="bg-orange-500 hover:bg-orange-600 ">Download Now</Button></Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <section id="#" className=' relative h-[100vh] flex justify-center items-center overflow-hidden px-5'>
        <Image src={BGimg} alt="bg image" className='w-full absolute h-[100vh] object-cover top-0 left-0 z-10' />
        <div className='w-full absolute top-0 left-0 z-20 bg-black opacity-50 h-screen' />
        <div className="custom-screen py-28 text-white z-30 ">
          <div className="space-y-5 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl text-white font-extrabold mx-auto sm:text-6xl">
              Haircuts and services at EpicHair Salon.
            </h1>
            <p className="max-w-xl mx-auto">
              Effortless bookings, stunning styles, and happy clients.
            </p>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-3 font-medium text-sm">
              {/* <Link
                href="/get-started"
                
              >
                <Button className="text-white text-sm w-40 bg-orange-800 hover:bg-orange-600 active:bg-blue-700 ">
                  Start building
                </Button>
              </Link> */}
              <a href='/' className='' >
                <Image src="https://www.vectorlogo.zone/logos/google_play/google_play-ar21.svg" width={150} height={70} alt='google play store' className='border rounded-lg  h-20 w-56  bg-gray-100' />
              </a>
              <a href='/'>
                <Image src="https://www.vectorlogo.zone/logos/apple_appstore/apple_appstore-ar21.svg" width={150} height={70} alt='Apple store' className='border rounded-lg h-20 w-56 bg-gray-100' />
              </a>
             
            </div>
          </div>
        </div>
      </section>


      <section id="feature" className="px-5">
        <div className='max-w-7xl mx-auto '>
          <SectionWrapper >
            <div id="features" className="custom-screen text-gray-600">
              <ul className="grid  gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {
                  features.map((item, idx) => (
                    <li key={idx} className="space-y-3">
                      <div className="w-12 h-12 border border-orange-600  text-orange-600  rounded-full flex items-center justify-center">
                        {item.icon}
                      </div>
                      <h4 className="text-lg text-gray-800 font-semibold">
                        {item.title}
                      </h4>
                      <p>
                        {item.desc}
                      </p>
                    </li>
                  ))
                }
              </ul>
            </div>
          </SectionWrapper>
        </div>
      </section>



      <section className='bg-orange-400 py-10 px-5 lg:h-[40vh] flex items-enter'>
        <div className="max-w-7xl  mx-auto grid grid-cols-1 text-white lg:grid-cols-2 items-center justify-center">


          <div className='flex flex-col items-center px-5  text-center gap-2 '>
              <Image src={One} alt='' className='w-32  rounded-full'/>
            <h2 className='text-xl font-bold'>Book your appointment</h2>
            <p>Download the EpicHair app and pick your favourite Barber to book your appointment</p>

</div>
          <div className='flex flex-col items-center  text-center gap-2 '>
            <Image src={Two} alt='' className='w-32  rounded-full' />
            <h2 className='text-xl font-bold'>Visit for your service</h2>
            <p>Go for your appointment to avail all the services you want</p>

</div>
        </div>
      </section>

      <section>

        <div className='grid grid-cols-2 lg:grid-cols-6 gap-2 max-w-7xl mx-auto py-10  justify-center items-center px-5'>
          <Image src={E1} alt='apk image' className='w-40' />
          <Image src={E2} alt='apk image' className='w-40' />
          <Image src={E3} alt='apk image' className='w-40' />
          <Image src={E4} alt='apk image' className='w-40' />
          <Image src={E5} alt='apk image' className='w-40' />
          <Image src={E6} alt='apk image' className='w-40' />

        </div>
      </section>
      <section>
        <div className='flex gap-2 px-5 max-w-7xl mx-auto relative py-20 overflow-hidden h-[80vh]  justify-between'>
          <Image src={E4} alt='' className='w-96 h-[70vh]  hidden lg:block top-0  p-2' />
          

          <div className='flex flex-col w-full lg:w-[55vw] justify-center items-center gap-4 '>

            <h2 className='text-4xl lg:text-6xl font-bold text-orange-500'>Download Now</h2>
            <div className='flex flex-col lg:flex-row gap-4 '>
              <a href='/' className='' >
                <Image src="https://www.vectorlogo.zone/logos/google_play/google_play-ar21.svg" width={200} height={200} alt='google play store' className='border rounded-lg h-24 w-64 bg-gray-100' />
            </a>
              <a href='/'>
                <Image src="https://www.vectorlogo.zone/logos/apple_appstore/apple_appstore-ar21.svg" width={200} height={200} alt='Apple store' className='border rounded-lg h-24 w-64 bg-gray-100' />
            </a>
              
            </div>

          </div>

        </div>
      </section>


      <section id="faq">
        <div className='max-w-4xl mx-auto px-5 py-10'>
          <h1 className='text-4xl font-bold py-10 text-center underline'>FAQ</h1>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>What services does EpicHair Salon offer?</AccordionTrigger>
              <AccordionContent>
                We provide a range of services including haircuts, styling, coloring, treatments, and grooming. Additional services may include beard trims, facials, and more.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Do I need to book an appointment in advance?</AccordionTrigger>
              <AccordionContent>
                While walk-ins are welcome, we recommend booking an appointment to ensure availability and avoid waiting.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How can I book an appointment?</AccordionTrigger>
              <AccordionContent>
                You can book an appointment by visiting our shop or calling us directly. We also offer an online booking option through our website for added convenience.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What are your operating hours?</AccordionTrigger>
              <AccordionContent>
                Our salon is open from [insert opening hours here]. Please check our website or contact us for any holiday timings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Are your hair stylists experienced?</AccordionTrigger>
              <AccordionContent>
                Yes, our team consists of highly skilled and experienced stylists who are passionate about delivering exceptional results tailored to your preferences.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>What products do you use?</AccordionTrigger>
              <AccordionContent>
                We use professional-grade, high-quality products to ensure the best care for your hair and scalp.
              </AccordionContent>
            </AccordionItem>

           

            <AccordionItem value="item-8">
              <AccordionTrigger>Can I reschedule or cancel my appointment?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Please contact us at least 24 hours in advance to reschedule or cancel your appointment without any fees.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>Do you accept walk-ins?</AccordionTrigger>
              <AccordionContent>
                Yes, we accept walk-ins based on availability. However, appointments are prioritized.
              </AccordionContent>
            </AccordionItem>

           

           
            <AccordionItem value="item-12">
              <AccordionTrigger>Do you provide hair consultations?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer consultations to discuss your hair goals and recommend the best services and products for you.
              </AccordionContent>
            </AccordionItem>

          

            <AccordionItem value="item-14">
              <AccordionTrigger>How do I prepare for a hair coloring appointment?</AccordionTrigger>
              <AccordionContent>
                Please avoid washing your hair for 24-48 hours before your appointment, as natural oils help protect your scalp during the coloring process.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15">
              <AccordionTrigger>Do you cater to special occasions like weddings or events?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer specialized styling and grooming services for weddings, parties, and other events. Contact us for packages and availability.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </section>

      <section className='h-full py-10 px-5 flex text-center  items-center bg-orange-500'>
      <div className=' max-w-7xl mx-auto font-bold'>
          <div className="w-full flex flex-col text-white justify-between items-center gap-2">
            <p className='text-xs lg:text-base'>copyright © 2024 EpicHair All Rights Reserved. Developed By <a className='underline' href="https://www.noblessetech.com/">Noblessetech</a> </p>

              <div className='flex gap-3 text-xs lg:text-base'>
                <Link className='underline' href="/privacy-policy">Privacy Policy</Link>
                <Link className='underline' href="/delete-account">Delete Account</Link>
              <Link className="underline" href="/about">
                About
              </Link>

              </div>
           

         </div>
      </div>
          
     </section>

    </main>
  )
}

export default page