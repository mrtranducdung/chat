import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function News() {
  const { t } = useLanguage();

  const newsItems = [
    {
      id: 1,
      title: t('news.item1.title'),
      excerpt: t('news.item1.excerpt'),
      date: t('news.item1.date'),
      author: t('news.item1.author'),
      category: t('news.item1.category'),
      image: 'https://picsum.photos/seed/ai-dashboard/800/500'
    },
    {
      id: 2,
      title: t('news.item2.title'),
      excerpt: t('news.item2.excerpt'),
      date: t('news.item2.date'),
      author: t('news.item2.author'),
      category: t('news.item2.category'),
      image: 'https://picsum.photos/seed/dx-future/800/500'
    },
    {
      id: 3,
      title: t('news.item3.title'),
      excerpt: t('news.item3.excerpt'),
      date: t('news.item3.date'),
      author: t('news.item3.author'),
      category: t('news.item3.category'),
      image: 'https://picsum.photos/seed/business-growth/800/500'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <section className="pt-32 pb-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            {t('news.title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('news.desc')}
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow">
                    {item.excerpt}
                  </p>
                  <Link to="#" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 text-sm mt-auto">
                    {t('news.readMore')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
