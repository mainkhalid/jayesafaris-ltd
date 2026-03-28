import React from "react";
import { SignInButton } from "@clerk/clerk-react";
import { Lock, ArrowRight, Compass } from "lucide-react";

const SignInPrompt = ({ title = "Authentication Required", message = "Please sign in to access this feature and start your safari journey.", illustration: Illustration = Compass }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/50">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
            <Illustration size={48} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white border-4 border-white">
            <Lock size={14} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {title}
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-light">
            {message}
          </p>
        </div>

        <div className="pt-4">
          <SignInButton mode="modal">
            <button className="w-full bg-stone-900 text-white py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-200 group flex items-center justify-center gap-3">
              Sign In to Continue
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </SignInButton>
          
          <p className="mt-6 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            Don't have an account? <span className="text-amber-600">Join Jaye Safaris</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPrompt;
