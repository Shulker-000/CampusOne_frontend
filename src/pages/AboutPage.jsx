import React from "react";
import OurStory from './../assets/about/ourStory.png'
const AboutPage = () => {
  return (
    <div className="bg-white text-slate-800">

      {/* SECTION: Mission */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <h2 className="text-3xl font-semibold mb-6">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              CampusOne is built to simplify how institutions manage their
              academic and administrative operations. Our goal is to provide
              a clear, structured system that reduces fragmentation and
              supports long-term growth.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Instead of forcing institutions to adapt to rigid software,
              CampusOne is designed to evolve alongside institutional needs.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-72 h-72 bg-slate-100 rounded-[40%]">
              <img src="/logo.png" className="p-4" alt="CampusOne" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Story */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Visual */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="w-80 h-56 bg-slate-200 rounded-xl" >
              <img src={OurStory} className="rounded-2xl p-3" alt="Our Story" />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-semibold mb-6">
              Our Story
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Many institutions rely on disconnected tools for admissions,
              academics, communication, and administration. This leads to
              inefficiency, duplication, and poor visibility.
            </p>
            <p className="text-slate-600 leading-relaxed">
              CampusOne began as an effort to design a unified system that
              prioritizes structure, clarity, and scalability from the start.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Scope */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10">
            What We’re Building
          </h2>

          <div className="grid sm:grid-cols-2 gap-y-6 gap-x-16 text-slate-600 text-left max-w-3xl mx-auto">
            <div>Institution profile and setup management</div>
            <div>Centralized academic configuration</div>
            <div>Role-based system foundation</div>
            <div>Secure authentication workflows</div>
          </div>
        </div>
      </section>

      {/* SECTION: Team */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Team
          </h2>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
            CampusOne is developed by a focused team working on clean system
            architecture, scalable foundations, and long-term maintainability
            for institutional platforms.
          </p>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
