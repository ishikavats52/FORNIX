import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import banner from '../Assets/banner.avif';

function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { value: "5000+", label: "Students Enrolled" },
    { value: "500+", label: "Qualified Doctors" },
    { value: "100+", label: "Expert Faculty" },
    { value: "98%", label: "Success Rate" }
  ];

  const courses = [
    { title: "NEET UG", path: "/courses/neet-ug", color: "bg-blue-500", desc: "Comprehensive prep for undergraduate medical entrance." },
    { title: "NEET PG", path: "/courses/neet-pg", color: "bg-green-500", desc: "Advanced concepts for postgraduate aspirants." },
    { title: "AMC", path: "/courses/amc", color: "bg-purple-500", desc: "Australian Medical Council exam preparation." },
    { title: "FMGE", path: "/courses/FMGE", color: "bg-red-500", desc: "Foreign Medical Graduate Examination mastery." },
    { title: "PLAB 1", path: "/courses/PLAB1", color: "bg-yellow-500", desc: "Your gateway to UK medical practice." }
  ];

  const testimonials = [
    { name: "Dr. Sarah Johnson", role: "NEET PG Rank 150", quote: "Fornix's QBank changed the game for me. The explanations are incredible." },
    { name: "Rajesh Kumar", role: "FMGE Qualified", quote: "I cleared FMGE in my first attempt thanks to the structured video lectures." },
    { name: "Emily Chen", role: "AMC Candidate", quote: "The best resource for AMC clinical reasoning. Highly recommended!" }
  ];

  const faqs = [
    { q: "Can I access the courses on mobile?", a: "Yes! Our platform is fully responsive and optimized for mobile learning." },
    { q: "Is there a free trial?", a: "We offer free demo subjects and quizzes so you can try before you buy." },
    { q: "How often is content updated?", a: "Our medical board updates content weekly to align with the latest exam patterns." },
    { q: "What happens if I get stuck?", a: "Premium members get access to 24/7 doubt resolution with expert faculty." }
  ];

  return (
    <div className="pt-32">

      {/* Hero Section */}
      <section className="relative mb-20">
        <div className="relative h-150 overflow-hidden">
          <img
            src={banner}
            alt="Fornix Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent flex flex-col justify-center px-6 md:px-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
              Master Medicine <br />
              <span className="text-orange-500">With Confidence</span>
            </h1>
            <p className="text-gray-200 text-xl mb-8 max-w-xl animate-fade-in-up delay-100">
              Your ultimate companion for NEET UG/PG, FMGE, PLAB, and AMC.
              Smart tools, expert content, and proven results.
            </p>
            {/* <div className="flex flex-wrap gap-4 animate-fade-in-up delay-200">
              <Link to="/courses" className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition transform hover:scale-105">
                Explore Courses
              </Link>
              <Link to="/signup" className="border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-gray-900 transition transform hover:scale-105">
                Join for Free
              </Link>
            </div> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 -mt-20 relative z-10 max-w-7xl mx-4 px-6 rounded-xl shadow-xl lg:mx-auto border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-4">
              <h3 className="text-4xl font-bold text-orange-500 mb-2">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold uppercase tracking-wide">Why Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Reinventing Medical Education</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Clinically Oriented", desc: "Learn with case-based scenarios that mirror real-world practice.", icon: "🩺" },
              { title: "High-Yield QBank", desc: "10,000+ questions curated to test high-probability exam topics.", icon: "📘" },
              { title: "Smart Analytics", desc: "Track your weak spots with our AI-driven performance dashboard.", icon: "📊" },
              { title: "Audio Podcast", desc: "High-yield medical audio content for learning anytime, anywhere.", icon: "🎧" },
              { title: "24/7 Chatbot Availability", desc: "High-yield medical audio content for learning anytime, anywhere.", icon: "🤖" },
              { title: "Revise smart. Perform better.", desc: "High-yield medical audio content for learning anytime, anywhere.", icon: "🧠" }


            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition duration-300">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      {/* <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-wide">Our Courses</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Choose Your Path</h2>
          </div>
          <Link to="/courses" className="text-orange-500 font-semibold hover:text-orange-600 hidden md:block">
            View All Courses →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <Link key={i} to={course.path} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 border border-gray-100 h-full flex flex-col">
                <div className={`h-2 bg-gray-900 group-hover:${course.color.replace('bg-', 'bg-')} transition-colors duration-300`}></div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition">{course.title}</h3>
                  <p className="text-gray-600 mb-6 flex-1">{course.desc}</p>
                  <div className="flex items-center text-orange-500 font-semibold mt-auto">
                    Start Learning
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="bg-gray-900 py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          {/* Abstract Pattern */}
          <svg width="100%" height="100%">
            <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:-translate-y-2 transition duration-300">
                <div className="text-orange-500 text-4xl mb-4">"</div>
                <p className="text-gray-300 italic mb-6 text-lg">{t.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold text-xl mr-4">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{t.name}</h4>
                    <p className="text-orange-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-lg text-gray-800">{faq.q}</span>
                <span className={`transform transition duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openFaq === i && (
                <div className="p-6 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-orange-500 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to Ace Your Exams?</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of medical students who trust Fornix for their exam preparation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/courses" className="bg-white text-orange-600 px-12 py-4 rounded-full font-bold shadow-lg hover:bg-gray-100 transition">
              Get Started Now
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-12 py-4 rounded-full font-bold hover:bg-white/10 transition">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

