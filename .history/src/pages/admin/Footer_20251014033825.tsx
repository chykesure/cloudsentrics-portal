{/* Footer Section */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-[#021a3d] via-[#032352] to-[#021a3d] text-white text-center py-8 shadow-inner overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse" />
        <h3 className="text-lg sm:text-2xl font-bold tracking-wide uppercase drop-shadow-lg">
          © {new Date().getFullYear()} Cloud Sentrics
        </h3>
        <p className="text-sm sm:text-base mt-2 text-gray-200 opacity-90 font-medium">
          Empowering businesses through seamless cloud operations and smart workflows.
        </p>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_6s_linear_infinite]" />
      </motion.footer>