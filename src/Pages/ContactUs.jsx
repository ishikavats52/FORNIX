import React from 'react'
import bgContact from '../assets/bg-contact.jpg'

function ContactUs() {

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${bgContact})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-48 max-w-7xl mx-auto px-6 pb-20">

        {/* Heading */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Contact Us
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Have questions or need support? Get in touch with us and our team
            will respond as soon as possible.
          </p>
        </section>

        {/* Content */}
        <section className="grid md:grid-cols-2 gap-12">

          {/* Contact Info*/}
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/30">
              <h3 className="text-xl font-semibold mb-2 text-white">Email Support</h3>
              <p className="text-white/90">info@fornixacademy.com</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/30">
              <h3 className="text-xl font-semibold mb-2 text-white">Call  Us</h3>
              <p className="text-white/90">996552448787</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-white/30">
              <h3 className="text-xl font-semibold mb-2 text-white">WhatsApp</h3>
              <p className="text-white/90">Chat with our support team</p>
              <button className="mt-3 text-orange-400 font-semibold hover:text-orange-300 transition">
                Start Chat →
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-white/30">
            <h3 className="text-2xl font-bold mb-6 text-white">Send Us a Message</h3>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
              />

              <textarea
                rows="4"
                placeholder="Your Message"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-lg hover:shadow-xl"
              >
                Send Message
              </button>
            </form>
          </div>

        </section>

      </div>
    </div>
  );
}
export default ContactUs

