import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  ExternalLink, 
  FileText, 
  Bug, 
  Zap, 
  Shield 
} from 'lucide-react';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Changelog', href: 'https://github.com/krdevanshu06/dailydiff/releases', icon: <FileText size={14} /> },
      { label: 'Feature Requests', href: 'https://github.com/krdevanshu06/dailydiff/issues', icon: <Zap size={14} /> },
      { label: 'Report a Bug', href: 'https://github.com/krdevanshu06/dailydiff/issues/new', icon: <Bug size={14} /> },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#', icon: <Shield size={14} /> },
      { label: 'Terms of Service', href: '#', icon: <FileText size={14} /> },
    ],
    social: [
      { label: 'GitHub', href: 'https://github.com/KrDevanshu06', icon: <Github size={18} /> },
      { label: 'Twitter', href: 'https://twitter.com/KrDevanshu06', icon: <Twitter size={18} /> },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/krdevanshu06', icon: <Linkedin size={18} /> },
      { label: 'Email', href: 'mailto:KrDevanshu06@gmail.com', icon: <Mail size={18} /> },
    ]
  };

  return (
    <footer className="mt-auto border-t border-gray-800/40 bg-[#0d1117]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-100">
              <span className="font-bold text-lg tracking-tight">Daily<span className="text-[#39d353]">Diff</span></span>
              <span className="px-2 py-0.5 rounded-full bg-[#39d353]/10 text-[#39d353] text-[10px] font-bold border border-[#39d353]/20">BETA</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The intelligent coding companion for developers who want to build consistent habits without the burnout.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/30 border border-gray-700/30 w-fit">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39d353] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39d353]"></span>
              </div>
              <span className="text-xs font-medium text-gray-400">Systems Operational</span>
            </div>
          </div>

          {/* Column 2: Product & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noreferrer" 
                    className="text-sm text-gray-500 hover:text-[#39d353] transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-gray-600 group-hover:text-[#39d353] transition-colors">{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h3>
            <div className="flex gap-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 border border-gray-700/50 hover:border-gray-600 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-gray-600">
              Questions? <a href="mailto:support@dailydiff.com" className="text-gray-400 hover:text-[#39d353] transition-colors">Contact Support</a>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            Made with <Heart size={12} className="text-red-500 fill-red-500/20 animate-pulse" /> by 
            <a href="https://github.com/KrDevanshu06" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#39d353] transition-colors font-medium">
              KrDevanshu06
            </a>
          </p>
          <div className="text-xs text-gray-600">
            © {currentYear} DailyDiff. Open Source under MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;