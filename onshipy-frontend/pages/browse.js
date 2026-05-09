import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

const ACTIVITY_POOL = [
  { user: 'Cole M.',   flag: 'US', action: 'imported', item: 'Nike Air Max 270' },
  { user: 'Jessie K.', flag: 'GB', action: 'profit',   profit: '+$350' },
  { user: 'Amara T.',  flag: 'NG', action: 'imported', item: 'Adidas Ultraboost' },
  { user: 'Riku S.',   flag: 'FI', action: 'sold',     item: 'Zara Blazer',      profit: '+$94' },
  { user: 'Sofia R.',  flag: 'ES', action: 'profit',   profit: '+$212' },
  { user: 'Liam O.',   flag: 'CA', action: 'imported', item: 'Apple AirPods Pro' },
  { user: 'Yuki N.',   flag: 'JP', action: 'sold',     item: 'ASOS Floral Dress', profit: '+$67' },
  { user: 'Diego M.',  flag: 'BR', action: 'profit',   profit: '+$489' },
  { user: 'Priya L.',  flag: 'IN', action: 'imported', item: 'Gucci GG Belt' },
  { user: 'Noah B.',   flag: 'ZA', action: 'sold',     item: 'Jordan 1 High',    profit: '+$130' },
  { user: 'Lea V.',    flag: 'DE', action: 'profit',   profit: '+$78' },
  { user: 'Marcus J.', flag: 'US', action: 'imported', item: 'Balenciaga Triple S' },
  { user: 'Chloe F.',  flag: 'FR', action: 'sold',     item: 'Dior Saddle Bag',  profit: '+$320' },
  { user: 'Tariq A.',  flag: 'AE', action: 'profit',   profit: '+$156' },
  { user: 'Mei W.',    flag: 'CN', action: 'imported', item: 'Dyson Airwrap' },
  { user: 'Oscar L.',  flag: 'SE', action: 'sold',     item: 'New Balance 550',  profit: '+$88' },
  { user: 'Nia G.',    flag: 'GH', action: 'imported', item: 'H&M Linen Set' },
  { user: 'Ben C.',    flag: 'AU', action: 'profit',   profit: '+$203' },
];

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Polaris-style SVG icon paths (20×20 viewBox)
const SVG = {
  fashion:     'M2.5 9.38a1.5 1.5 0 0 1 .44-1.06L9.38 1.88A1.5 1.5 0 0 1 10.44 1.5H16.5a2 2 0 0 1 2 2v6.06a1.5 1.5 0 0 1-.44 1.06l-6.44 6.44a1.5 1.5 0 0 1-2.12 0l-6.56-6.56A1.5 1.5 0 0 1 2.5 9.38ZM13.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  electronics: 'M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7ZM10 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM7.5 4.5h5v9h-5v-9Z',
  beauty:      'M10 17c-.28 0-.53-.11-.71-.29L3.64 11.1A4.5 4.5 0 0 1 10 4.6a4.5 4.5 0 0 1 6.36 6.5l-5.65 5.61A1 1 0 0 1 10 17Z',
  sports:      'M6 2v7a4 4 0 0 0 8 0V2H6Zm2 11h4v2H8v-2ZM4 3H2v3a3 3 0 0 0 2.83 3A5.48 5.48 0 0 1 4 7V3Zm14 0h-2v4c0 .73-.17 1.42-.45 2.03A3 3 0 0 0 18 6V3Z',
  sneakers:    'M3.5 13.5A1.5 1.5 0 0 0 5 15h10a1.5 1.5 0 0 0 1.5-1.5v-.75L14 8l-2.5 1.5L9 7.5 6.5 9 4 8.5l-.5 5Z',
  home:        'M10 2L2 9h2v9h4v-4h4v4h4V9h2L10 2Z',
  watches:     'M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2Zm.75 4v4.44l2.53 2.53-1.06 1.06L9.25 11V6h1.5Z',
  bags:        'M6.5 3A1.5 1.5 0 0 0 5 4.5V6H3.5A1.5 1.5 0 0 0 2 7.5v9A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 6H15V4.5A1.5 1.5 0 0 0 13.5 3h-7ZM13.5 6h-7V4.5h7V6Z',
  amazon:      'M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z',
  kids:        'M10 2l2.09 4.26L17 7.27l-3.5 3.41.82 4.82L10 13.27l-4.32 2.23.82-4.82L3 7.27l4.91-.71L10 2Z',
  gaming:      'M6 7.5A4.5 4.5 0 0 0 1.5 12v1A3.5 3.5 0 0 0 5 16.5h10a3.5 3.5 0 0 0 3.5-3.5v-1A4.5 4.5 0 0 0 14 7.5H6ZM7 11H5.5v1.5h-1V11H3v-1h1.5V8.5h1V10H7v1Zm5.5 1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  food:        'M7.5 2a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 6.75 5.75v-3A.75.75 0 0 1 7.5 2Zm2.5 0a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 9.25 5.75v-3A.75.75 0 0 1 10 2Zm2.5 0a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 11.75 5.75v-3A.75.75 0 0 1 12.5 2Z',
  // utility
  fire:        'M10 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-2.5-1-4-1-4s-1 2-2 2-2-1-2-2c0-2 3-4 1-6ZM8.5 15.5a1.5 1.5 0 0 1-1.5-1.5c0-2 1.5-3 1.5-3s1.5 1 1.5 3a1.5 1.5 0 0 1-1.5 1.5Z',
  arrowRight:  'M9 18 15 12 9 6',
  profit:      'M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 4v4.586l-2.293-2.293-1.414 1.414L10 13.414l3.707-3.707-1.414-1.414L10 10.586V6h-0Z',
  cart:        'M2 3h1.74l2.5 8.5H15l2-6H5.24',
  link:        'M11 5H7a4 4 0 0 0 0 8h4m2-8h4a4 4 0 0 1 0 8h-4M8 10h8',
};

const Icon = ({ d, size = 18, color = 'currentColor', stroke = false, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20"
    fill={stroke ? 'none' : color}
    stroke={stroke ? color : 'none'}
    strokeWidth={stroke ? strokeWidth : undefined}
    strokeLinecap={stroke ? 'round' : undefined}
    strokeLinejoin={stroke ? 'round' : undefined}
  >
    <path d={d} />
  </svg>
);

const NICHES = {
  fashion: {
    label: 'Fashion', icon: 'fashion', color: '#1a1a2e',
    brands: [
      { name: 'Nike',          url: 'https://www.nike.com',                     color: '#111',    hot: true  },
      { name: 'Adidas',        url: 'https://www.adidas.com',                   color: '#000',    hot: true  },
      { name: 'Zara',          url: 'https://www.zara.com',                     color: '#1a1a1a', hot: false },
      { name: 'ASOS',          url: 'https://www.asos.com',                     color: '#2d2d2d', hot: true  },
      { name: 'H&M',           url: 'https://www.hm.com',                       color: '#e50010', hot: false },
      { name: 'Gucci',         url: 'https://www.gucci.com',                    color: '#2c2c2c', hot: false },
      { name: 'Balenciaga',    url: 'https://www.balenciaga.com',               color: '#000',    hot: true  },
      { name: 'Dior',          url: 'https://www.dior.com',                     color: '#1a1a1a', hot: false },
      { name: 'Off-White',     url: 'https://www.off---white.com',              color: '#000',    hot: true  },
      { name: 'Stone Island',  url: 'https://www.stoneisland.com',              color: '#333',    hot: false },
      { name: 'Palace',        url: 'https://shop.palaceskateboards.com',       color: '#000',    hot: true  },
      { name: 'Acne Studios',  url: 'https://www.acnestudios.com',              color: '#333',    hot: false },
      { name: 'Uniqlo',        url: 'https://www.uniqlo.com',                   color: '#e40012', hot: true  },
      { name: 'Carhartt WIP',  url: 'https://www.carhartt-wip.com',             color: '#3b3024', hot: true  },
      { name: 'Stussy',        url: 'https://www.stussy.com',                   color: '#000',    hot: true  },
      { name: 'Supreme',       url: 'https://www.supremenewyork.com',           color: '#e42b20', hot: true  },
      { name: 'Kith',          url: 'https://kith.com',                         color: '#1a1a1a', hot: true  },
      { name: 'Fear of God',   url: 'https://fearofgod.com',                    color: '#333',    hot: true  },
      { name: 'Ralph Lauren',  url: 'https://www.ralphlauren.com',              color: '#00205b', hot: false },
      { name: 'Lacoste',       url: 'https://www.lacoste.com',                  color: '#00843d', hot: false },
      { name: 'Calvin Klein',  url: 'https://www.calvinklein.com',              color: '#1a1a1a', hot: false },
      { name: "Levi's",        url: 'https://www.levis.com',                    color: '#c8102e', hot: false },
      { name: 'Burberry',      url: 'https://www.burberry.com',                 color: '#3b1f0f', hot: false },
      { name: 'Versace',       url: 'https://www.versace.com',                  color: '#c4a24a', hot: false },
      { name: 'Saint Laurent', url: 'https://www.ysl.com',                      color: '#000',    hot: true  },
      { name: 'Moncler',       url: 'https://www.moncler.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Ami Paris',     url: 'https://www.amiparis.com',                 color: '#e8001c', hot: true  },
      { name: 'A.P.C.',        url: 'https://www.apc.fr',                       color: '#1a1a1a', hot: false },
      { name: 'Mango',         url: 'https://www.mango.com',                    color: '#222',    hot: false },
      { name: 'COS',           url: 'https://www.cosstores.com',                color: '#1a1a1a', hot: false },
    ]
  },
  electronics: {
    label: 'Electronics', icon: 'electronics', color: '#1428A0',
    brands: [
      { name: 'Apple',         url: 'https://www.apple.com',                    color: '#1d1d1f', hot: true  },
      { name: 'Samsung',       url: 'https://www.samsung.com',                  color: '#1428A0', hot: true  },
      { name: 'Sony',          url: 'https://www.sony.com',                     color: '#000',    hot: false },
      { name: 'Bose',          url: 'https://www.bose.com',                     color: '#000',    hot: true  },
      { name: 'Dyson',         url: 'https://www.dyson.com',                    color: '#C41230', hot: true  },
      { name: 'DJI',           url: 'https://www.dji.com',                      color: '#1c1c1c', hot: true  },
      { name: 'Logitech',      url: 'https://www.logitech.com',                 color: '#00b3f0', hot: false },
      { name: 'GoPro',         url: 'https://gopro.com',                        color: '#0f3d6b', hot: true  },
      { name: 'Razer',         url: 'https://www.razer.com',                    color: '#00d900', hot: true  },
      { name: 'Beats',         url: 'https://www.beatsbydre.com',               color: '#e3001b', hot: true  },
      { name: 'Bang & Olufsen',url: 'https://www.bang-olufsen.com',             color: '#222',    hot: false },
      { name: 'JBL',           url: 'https://www.jbl.com',                      color: '#e4002b', hot: true  },
      { name: 'Marshall',      url: 'https://www.marshallheadphones.com',       color: '#1a1a1a', hot: false },
      { name: 'Sennheiser',    url: 'https://www.sennheiser.com',               color: '#000',    hot: false },
      { name: 'Anker',         url: 'https://www.anker.com',                    color: '#00a0e9', hot: true  },
      { name: 'Jabra',         url: 'https://www.jabra.com',                    color: '#003087', hot: false },
      { name: 'Canon',         url: 'https://www.canon.com',                    color: '#bc0000', hot: false },
      { name: 'Nikon',         url: 'https://www.nikon.com',                    color: '#ffd700', hot: false },
      { name: 'Fujifilm',      url: 'https://www.fujifilm.com',                 color: '#e31837', hot: true  },
      { name: 'Garmin',        url: 'https://www.garmin.com',                   color: '#007cc3', hot: true  },
      { name: 'Nothing',       url: 'https://nothing.tech',                     color: '#1a1a1a', hot: true  },
      { name: 'OnePlus',       url: 'https://www.oneplus.com',                  color: '#f5010c', hot: false },
    ]
  },
  beauty: {
    label: 'Beauty', icon: 'beauty', color: '#c8385a',
    brands: [
      { name: 'Charlotte Tilbury', url: 'https://www.charlottetilbury.com',    color: '#c8a882', hot: true  },
      { name: 'Glossier',      url: 'https://www.glossier.com',                 color: '#e8c5c1', hot: true  },
      { name: 'NARS',          url: 'https://www.narscosmetics.com',            color: '#000',    hot: false },
      { name: 'Aesop',         url: 'https://www.aesop.com',                    color: '#3c3c3c', hot: false },
      { name: 'Tatcha',        url: 'https://www.tatcha.com',                   color: '#c2945a', hot: true  },
      { name: 'Fenty Beauty',  url: 'https://fentybeauty.com',                  color: '#c8385a', hot: true  },
      { name: 'MAC',           url: 'https://www.maccosmetics.com',             color: '#1a1a1a', hot: false },
      { name: 'Rare Beauty',   url: 'https://www.rarebeauty.com',               color: '#d4a5b0', hot: true  },
      { name: 'Drunk Elephant',url: 'https://www.drunkelephant.com',            color: '#f28c28', hot: true  },
      { name: "Paula's Choice",url: 'https://www.paulaschoice.com',             color: '#2e2e2e', hot: false },
      { name: 'The Ordinary',  url: 'https://theordinary.com',                  color: '#1a1a1a', hot: true  },
      { name: 'La Mer',        url: 'https://www.cremedelamer.com',             color: '#2b5a8c', hot: false },
      { name: 'SK-II',         url: 'https://www.sk-ii.com',                    color: '#c8102e', hot: false },
      { name: "Kiehl's",       url: 'https://www.kiehls.com',                   color: '#1a1a1a', hot: false },
      { name: 'Byredo',        url: 'https://www.byredo.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Jo Malone',     url: 'https://www.jomalone.com',                 color: '#c8a882', hot: false },
      { name: 'Tom Ford Beauty', url: 'https://www.tomfordbeauty.com',          color: '#1a1a1a', hot: true  },
      { name: 'Diptyque',      url: 'https://www.diptyqueparis.com',            color: '#1a1a1a', hot: false },
      { name: 'Urban Decay',   url: 'https://www.urbandecay.com',               color: '#3b1f8c', hot: false },
      { name: 'NYX',           url: 'https://www.nyxcosmetics.com',             color: '#000',    hot: false },
      { name: 'Estée Lauder',  url: 'https://www.esteelauder.com',              color: '#1a1a1a', hot: false },
      { name: 'Clinique',      url: 'https://www.clinique.com',                 color: '#00a651', hot: false },
    ]
  },
  sports: {
    label: 'Sports', icon: 'sports', color: '#1a6b3a',
    brands: [
      { name: 'Nike',          url: 'https://www.nike.com',                     color: '#111',    hot: true  },
      { name: 'Adidas',        url: 'https://www.adidas.com',                   color: '#000',    hot: true  },
      { name: 'Under Armour',  url: 'https://www.underarmour.com',              color: '#1D1D1D', hot: false },
      { name: 'Gymshark',      url: 'https://www.gymshark.com',                 color: '#25262b', hot: true  },
      { name: 'Lululemon',     url: 'https://www.lululemon.com',                color: '#000',    hot: true  },
      { name: 'New Balance',   url: 'https://www.newbalance.com',               color: '#cf0a2c', hot: false },
      { name: 'Puma',          url: 'https://www.puma.com',                     color: '#000',    hot: false },
      { name: 'ASICS',         url: 'https://www.asics.com',                    color: '#003da5', hot: false },
      { name: 'Reebok',        url: 'https://www.reebok.com',                   color: '#cc0000', hot: true  },
      { name: 'Hoka',          url: 'https://www.hoka.com',                     color: '#ff5f1f', hot: true  },
      { name: 'On Running',    url: 'https://www.on-running.com',               color: '#1a1a1a', hot: true  },
      { name: 'Salomon',       url: 'https://www.salomon.com',                  color: '#000',    hot: false },
      { name: 'The North Face',url: 'https://www.thenorthface.com',             color: '#e31837', hot: true  },
      { name: 'Patagonia',     url: 'https://www.patagonia.com',                color: '#1a5276', hot: false },
      { name: 'Columbia',      url: 'https://www.columbia.com',                 color: '#003da5', hot: false },
      { name: 'Alo Yoga',      url: 'https://www.aloyoga.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Vuori',         url: 'https://www.vuoriclothing.com',            color: '#3b5998', hot: true  },
      { name: 'Brooks',        url: 'https://www.brooksrunning.com',            color: '#003da5', hot: false },
      { name: 'Fila',          url: 'https://www.fila.com',                     color: '#003da5', hot: false },
      { name: 'Speedo',        url: 'https://www.speedo.com',                   color: '#003da5', hot: false },
    ]
  },
  sneakers: {
    label: 'Sneakers', icon: 'sneakers', color: '#7c3aed',
    brands: [
      { name: 'Nike SNKRS',    url: 'https://www.nike.com/launch',              color: '#111',    hot: true  },
      { name: 'Jordan Brand',  url: 'https://www.nike.com/jordan',              color: '#e41c23', hot: true  },
      { name: 'Adidas Originals', url: 'https://www.adidas.com/originals',      color: '#000',    hot: true  },
      { name: 'New Balance',   url: 'https://www.newbalance.com',               color: '#cf0a2c', hot: true  },
      { name: 'Vans',          url: 'https://www.vans.com',                     color: '#e31837', hot: false },
      { name: 'Converse',      url: 'https://www.converse.com',                 color: '#000',    hot: false },
      { name: 'ASICS',         url: 'https://www.asics.com',                    color: '#003da5', hot: true  },
      { name: 'Saucony',       url: 'https://www.saucony.com',                  color: '#005fb0', hot: true  },
      { name: 'Hoka',          url: 'https://www.hoka.com',                     color: '#ff5f1f', hot: true  },
      { name: 'Mizuno',        url: 'https://www.mizunousa.com',                color: '#003da5', hot: false },
      { name: 'Reebok',        url: 'https://www.reebok.com',                   color: '#cc0000', hot: false },
      { name: 'Golden Goose',  url: 'https://www.goldengoose.com',              color: '#1a1a1a', hot: true  },
      { name: 'Common Projects', url: 'https://www.commonprojects.com',         color: '#1a1a1a', hot: true  },
      { name: 'Clarks Originals', url: 'https://www.clarksusa.com',             color: '#8b6914', hot: false },
      { name: 'Birkenstock',   url: 'https://www.birkenstock.com',              color: '#c8a87a', hot: true  },
      { name: 'Filling Pieces',url: 'https://www.fillingpieces.com',            color: '#1a1a1a', hot: false },
      { name: 'On Running',    url: 'https://www.on-running.com',               color: '#1a1a1a', hot: true  },
      { name: 'Brooks',        url: 'https://www.brooksrunning.com',            color: '#003da5', hot: false },
    ]
  },
  home: {
    label: 'Home & Living', icon: 'home', color: '#0284c7',
    brands: [
      { name: 'IKEA',          url: 'https://www.ikea.com',                     color: '#0058A3', hot: false },
      { name: 'Muji',          url: 'https://www.muji.com',                     color: '#1a1a1a', hot: true  },
      { name: 'West Elm',      url: 'https://www.westelm.com',                  color: '#2f2f2f', hot: false },
      { name: 'Hay',           url: 'https://www.hay.dk',                       color: '#000',    hot: true  },
      { name: 'Crate & Barrel',url: 'https://www.crateandbarrel.com',           color: '#333',    hot: false },
      { name: 'Anthropologie', url: 'https://www.anthropologie.com',            color: '#3d3d3d', hot: true  },
      { name: 'Zara Home',     url: 'https://www.zarahome.com',                 color: '#1a1a1a', hot: false },
      { name: 'H&M Home',      url: 'https://www.hm.com/home',                  color: '#e50010', hot: false },
      { name: 'Ferm Living',   url: 'https://www.fermliving.com',               color: '#2b2b2b', hot: true  },
      { name: 'Pottery Barn',  url: 'https://www.potterybarn.com',              color: '#5c3d1e', hot: false },
      { name: 'Williams-Sonoma', url: 'https://www.williams-sonoma.com',        color: '#2e2e2e', hot: false },
      { name: 'RH',            url: 'https://rh.com',                           color: '#1a1a1a', hot: true  },
      { name: 'Marimekko',     url: 'https://www.marimekko.com',                color: '#e31837', hot: true  },
      { name: 'Vitra',         url: 'https://www.vitra.com',                    color: '#1a1a1a', hot: false },
      { name: 'Herman Miller', url: 'https://www.hermanmiller.com',             color: '#c8102e', hot: false },
      { name: 'Article',       url: 'https://www.article.com',                  color: '#2d2d2d', hot: true  },
    ]
  },
  watches: {
    label: 'Watches', icon: 'watches', color: '#92400e',
    brands: [
      { name: 'Rolex',         url: 'https://www.rolex.com',                    color: '#006039', hot: true  },
      { name: 'Omega',         url: 'https://www.omegawatches.com',             color: '#1d1d1b', hot: true  },
      { name: 'TAG Heuer',     url: 'https://www.tagheuer.com',                 color: '#c8102e', hot: false },
      { name: 'Seiko',         url: 'https://www.seikowatches.com',             color: '#1a1a1a', hot: true  },
      { name: 'Casio G-Shock', url: 'https://www.casio.com/gshock',             color: '#000',    hot: true  },
      { name: 'Daniel Wellington', url: 'https://www.danielwellington.com',     color: '#1d1d1b', hot: false },
      { name: 'Tissot',        url: 'https://www.tissotwatches.com',            color: '#c00',    hot: false },
      { name: 'Hamilton',      url: 'https://www.hamiltonwatch.com',            color: '#1a1a1a', hot: false },
      { name: 'IWC',           url: 'https://www.iwc.com',                      color: '#1a1a1a', hot: false },
      { name: 'Breitling',     url: 'https://www.breitling.com',                color: '#c8102e', hot: false },
      { name: 'Cartier',       url: 'https://www.cartier.com',                  color: '#c8a882', hot: true  },
      { name: 'Tudor',         url: 'https://www.tudorwatch.com',               color: '#1a1a1a', hot: true  },
      { name: 'Nomos',         url: 'https://nomos-glashuette.com',             color: '#1a1a1a', hot: false },
      { name: 'Swatch',        url: 'https://www.swatch.com',                   color: '#c8102e', hot: true  },
      { name: 'Fossil',        url: 'https://www.fossil.com',                   color: '#8b6914', hot: false },
      { name: 'Citizen',       url: 'https://www.citizenwatch.com',             color: '#003da5', hot: false },
    ]
  },
  bags: {
    label: 'Bags & Accessories', icon: 'bags', color: '#a16207',
    brands: [
      { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com',             color: '#8b6914', hot: true  },
      { name: 'Chanel',        url: 'https://www.chanel.com',                   color: '#000',    hot: true  },
      { name: 'Hermès',        url: 'https://www.hermes.com',                   color: '#e07000', hot: true  },
      { name: 'Prada',         url: 'https://www.prada.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Fendi',         url: 'https://www.fendi.com',                    color: '#8b6914', hot: false },
      { name: 'Celine',        url: 'https://www.celine.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Coach',         url: 'https://www.coach.com',                    color: '#b5872a', hot: false },
      { name: 'Michael Kors',  url: 'https://www.michaelkors.com',              color: '#c5a028', hot: false },
      { name: 'Kate Spade',    url: 'https://www.katespade.com',                color: '#000',    hot: false },
      { name: 'Telfar',        url: 'https://telfar.net',                       color: '#000',    hot: true  },
      { name: 'Bottega Veneta',url: 'https://www.bottegaveneta.com',            color: '#5a3e28', hot: true  },
      { name: 'Loewe',         url: 'https://www.loewe.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Jacquemus',     url: 'https://www.jacquemus.com',                color: '#1a1a1a', hot: true  },
      { name: 'Burberry',      url: 'https://www.burberry.com',                 color: '#3b1f0f', hot: false },
      { name: 'MCM',           url: 'https://www.mcmworldwide.com',             color: '#c8a882', hot: false },
      { name: 'Mulberry',      url: 'https://www.mulberry.com',                 color: '#5a3e28', hot: false },
      { name: 'Miu Miu',       url: 'https://www.miumiu.com',                   color: '#e8c5c1', hot: true  },
      { name: 'Strathberry',   url: 'https://www.strathberry.com',              color: '#c8a882', hot: true  },
    ]
  },
  amazon: {
    label: 'Amazon Finds', icon: 'amazon', color: '#cc8400',
    brands: [
      { name: 'Amazon US',     url: 'https://www.amazon.com',                   color: '#ff9900', hot: true  },
      { name: 'Amazon UK',     url: 'https://www.amazon.co.uk',                 color: '#ff9900', hot: true  },
      { name: 'Amazon DE',     url: 'https://www.amazon.de',                    color: '#ff9900', hot: false },
      { name: 'Amazon FR',     url: 'https://www.amazon.fr',                    color: '#ff9900', hot: false },
      { name: 'Amazon CA',     url: 'https://www.amazon.ca',                    color: '#ff9900', hot: false },
      { name: 'Amazon AU',     url: 'https://www.amazon.com.au',                color: '#ff9900', hot: false },
      { name: 'Amazon JP',     url: 'https://www.amazon.co.jp',                 color: '#ff9900', hot: false },
      { name: 'Amazon ES',     url: 'https://www.amazon.es',                    color: '#ff9900', hot: false },
      { name: 'Amazon IT',     url: 'https://www.amazon.it',                    color: '#ff9900', hot: false },
      { name: 'Amazon MX',     url: 'https://www.amazon.com.mx',                color: '#ff9900', hot: false },
      { name: 'Amazon IN',     url: 'https://www.amazon.in',                    color: '#ff9900', hot: false },
    ]
  },
  kids: {
    label: 'Kids & Toys', icon: 'kids', color: '#d97706',
    brands: [
      { name: 'Lego',          url: 'https://www.lego.com',                     color: '#e3000b', hot: true  },
      { name: 'Nike Kids',     url: 'https://www.nike.com/kids',                color: '#111',    hot: true  },
      { name: 'Adidas Kids',   url: 'https://www.adidas.com/kids',              color: '#000',    hot: false },
      { name: 'Gap Kids',      url: 'https://www.gap.com/kids',                 color: '#00254b', hot: false },
      { name: 'Fisher-Price',  url: 'https://www.fisher-price.com',             color: '#e31e24', hot: false },
      { name: 'Hasbro',        url: 'https://www.hasbro.com',                   color: '#003087', hot: true  },
      { name: 'Mattel',        url: 'https://www.mattel.com',                   color: '#e31e24', hot: false },
      { name: 'Funko Pop',     url: 'https://www.funko.com',                    color: '#e31e24', hot: true  },
      { name: 'Playmobil',     url: 'https://www.playmobil.com',                color: '#e31e24', hot: false },
      { name: 'VTech',         url: 'https://www.vtech.com',                    color: '#003da5', hot: false },
      { name: 'Barbie',        url: 'https://barbie.mattel.com',                color: '#e75480', hot: true  },
      { name: 'Hot Wheels',    url: 'https://hotwheels.mattel.com',             color: '#e31e24', hot: true  },
      { name: 'Nerf',          url: 'https://www.hasbro.com/nerf',              color: '#ff6600', hot: true  },
      { name: 'Marvel Toys',   url: 'https://www.marvel.com/toys',              color: '#e31e24', hot: true  },
      { name: 'Disney Toys',   url: 'https://www.shopdisney.com',               color: '#003da5', hot: false },
    ]
  },
  gaming: {
    label: 'Gaming', icon: 'gaming', color: '#6d28d9',
    brands: [
      { name: 'PlayStation',   url: 'https://www.playstation.com',              color: '#003087', hot: true  },
      { name: 'Xbox',          url: 'https://www.xbox.com',                     color: '#107c10', hot: true  },
      { name: 'Nintendo',      url: 'https://www.nintendo.com',                 color: '#e4000f', hot: true  },
      { name: 'Razer',         url: 'https://www.razer.com',                    color: '#00d900', hot: true  },
      { name: 'SteelSeries',   url: 'https://steelseries.com',                  color: '#f60',    hot: false },
      { name: 'HyperX',        url: 'https://www.hyperxgaming.com',             color: '#d00',    hot: false },
      { name: 'Corsair',       url: 'https://www.corsair.com',                  color: '#ffd700', hot: false },
      { name: 'ASUS ROG',      url: 'https://rog.asus.com',                     color: '#e00',    hot: true  },
      { name: 'Alienware',     url: 'https://www.alienware.com',                color: '#1a1a1a', hot: true  },
      { name: 'MSI Gaming',    url: 'https://www.msi.com/gaming',               color: '#c8102e', hot: false },
      { name: 'Logitech G',    url: 'https://www.logitechg.com',                color: '#00b3f0', hot: false },
      { name: 'Turtle Beach',  url: 'https://www.turtlebeach.com',              color: '#003da5', hot: false },
      { name: 'Secretlab',     url: 'https://secretlab.co',                     color: '#1a1a1a', hot: true  },
      { name: 'Elgato',        url: 'https://www.elgato.com',                   color: '#1a1a1a', hot: true  },
    ]
  },
  food: {
    label: 'Food & Wellness', icon: 'food', color: '#166534',
    brands: [
      { name: 'Optimum Nutrition', url: 'https://www.optimumnutrition.com',     color: '#003087', hot: true  },
      { name: 'MyProtein',     url: 'https://www.myprotein.com',                color: '#f60',    hot: true  },
      { name: 'GNC',           url: 'https://www.gnc.com',                      color: '#003087', hot: false },
      { name: 'Holland & Barrett', url: 'https://www.hollandandbarrett.com',    color: '#00843d', hot: false },
      { name: 'Whittard',      url: 'https://www.whittard.co.uk',               color: '#1a3a1a', hot: false },
      { name: 'Fortnum & Mason', url: 'https://www.fortnumandmason.com',        color: '#6b4226', hot: false },
      { name: 'AG1',           url: 'https://drinkag1.com',                     color: '#3b5323', hot: true  },
      { name: 'Herbalife',     url: 'https://www.herbalife.com',                color: '#e31837', hot: false },
      { name: 'Applied Nutrition', url: 'https://www.appliednutrition.com',     color: '#1a1a1a', hot: true  },
      { name: 'PhD Nutrition', url: 'https://www.phd.com',                      color: '#003da5', hot: false },
      { name: 'Quest Nutrition', url: 'https://www.questnutrition.com',         color: '#e31e24', hot: true  },
      { name: 'Garden of Life',url: 'https://www.gardenoflife.com',             color: '#3b5323', hot: false },
      { name: 'Vital Proteins',url: 'https://www.vitalproteins.com',            color: '#e8c5c1', hot: true  },
      { name: 'Thorne',        url: 'https://www.thorne.com',                   color: '#3b5323', hot: false },
    ]
  },
};

const categories = Object.keys(NICHES);

function ActivityPill({ item, visible }) {
  const isProfit = item.action === 'profit';
  const isSold   = item.action === 'sold';
  const bgIcon   = isProfit ? '#008060' : isSold ? '#1d4ed8' : '#7c3aed';
  const iconPath = isProfit
    ? 'M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm.75 4v4.44l2.53 2.53-1.06 1.06L9.25 11V6h1.5Z'
    : isSold
    ? 'M6.5 3A1.5 1.5 0 0 0 5 4.5V6H3.5A1.5 1.5 0 0 0 2 7.5v9A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 6H15V4.5A1.5 1.5 0 0 0 13.5 3h-7ZM13.5 6h-7V4.5h7V6Z'
    : 'M2.5 9.38a1.5 1.5 0 0 1 .44-1.06L9.38 1.88A1.5 1.5 0 0 1 10.44 1.5H16.5a2 2 0 0 1 2 2v6.06a1.5 1.5 0 0 1-.44 1.06l-6.44 6.44a1.5 1.5 0 0 1-2.12 0l-6.56-6.56A1.5 1.5 0 0 1 2.5 9.38ZM13.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '9px 13px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(20px)',
      transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      minWidth: 240, maxWidth: 280,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={iconPath} size={15} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{item.flag}</span>
          <span>{item.user}</span>
          {isProfit && <span style={{ color: '#69f0ae', fontWeight: 700 }}>{item.profit}</span>}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isProfit ? 'profit made this session' : isSold ? `sold ${item.item} · ${item.profit}` : `imported ${item.item}`}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  const router = useRouter();
  const { niche } = router.query;
  const tokenRef = useRef('');
  const [importUrl, setImportUrl]     = useState('');
  const [importing, setImporting]     = useState(false);
  const [importMsg, setImportMsg]     = useState('');
  const [embeddedUrl, setEmbeddedUrl] = useState(null);
  const [embeddedBrand, setEmbeddedBrand] = useState(null);
  const [notifs, setNotifs]           = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [trendingSlide, setTrendingSlide] = useState(0);
  const [search, setSearch]           = useState('');
  const activityQueue = useRef(shuffle(ACTIVITY_POOL));
  const activityIdx   = useRef(0);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    const iv = setInterval(() => {
      if (activityIdx.current >= activityQueue.current.length) {
        activityQueue.current = shuffle(ACTIVITY_POOL);
        activityIdx.current = 0;
      }
      const item = activityQueue.current[activityIdx.current++];
      setNotifs([{ ...item, id: Date.now() }]);
      setNotifVisible(true);
      setTimeout(() => setNotifVisible(false), 3500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const nicheData = niche && NICHES[niche];

  useEffect(() => {
    if (!nicheData) return;
    const trending = nicheData.brands.filter(b => b.hot);
    if (trending.length <= 1) return;
    const iv = setInterval(() => setTrendingSlide(s => (s + 1) % trending.length), 2600);
    return () => clearInterval(iv);
  }, [niche]);

  const handleImport = async (url) => {
    if (!url) return;
    setImporting(true); setImportMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setImportMsg('error:' + (data.error || 'Failed')); return; }
      setImportMsg('success:Product imported! Go to Products to set your price.');
    } catch { setImportMsg('error:Connection failed'); }
    finally { setImporting(false); }
  };

  const openBrand  = brand => { setEmbeddedUrl(brand.url); setEmbeddedBrand(brand); };
  const closeEmbed = ()    => { setEmbeddedUrl(null); setEmbeddedBrand(null); };

  const inp = {
    flex: 1, padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8,
    fontSize: P.fontSize, outline: 'none', fontFamily: P.font,
    letterSpacing: P.letterSpacing, color: P.text, background: '#fff',
  };

  // ── Brand detail page ─────────────────────────────────────────────────────
  if (embeddedUrl && embeddedBrand) {
    return (
      <Layout title={`Browse — ${embeddedBrand.name}`}>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .step-card { background:#fff; border:1px solid ${P.border}; border-radius:12px; padding:20px; display:flex; gap:14px; align-items:flex-start; transition:box-shadow .15s; }
          .step-card:hover { box-shadow:0 2px 10px rgba(0,0,0,0.07); }
          .step-num { width:28px; height:28px; border-radius:50%; background:rgba(48,48,48,1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0; }
        `}</style>

        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 60px' }}>
          <button onClick={closeEmbed} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, fontSize: P.fontSize, fontFamily: P.font, padding: 0, marginBottom: 20, fontWeight: 500 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back to {nicheData?.label}
          </button>

          <div style={{ background: embeddedBrand.color, borderRadius: 16, padding: '32px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0) 60%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {embeddedBrand.hot && (
                    <><Icon d={SVG.fire} size={12} color="rgba(255,255,255,0.7)" /> Trending brand</>
                  )}
                  {!embeddedBrand.hot && (
                    <><Icon d={SVG.amazon} size={12} color="rgba(255,255,255,0.7)" /> Brand</>
                  )}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 4 }}>{embeddedBrand.name}</div>
                <div style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.55)' }}>{embeddedUrl}</div>
              </div>
              <a href={embeddedUrl} target="_blank" rel="noreferrer" style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: P.fontSize, textDecoration: 'none', fontFamily: P.font, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                Visit {embeddedBrand.name}
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>How to import from {embeddedBrand.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { n: 1, title: `Visit ${embeddedBrand.name}`, desc: 'Click "Visit" above — the site opens in a new tab', action: <a href={embeddedUrl} target="_blank" rel="noreferrer" style={{ padding: '5px 12px', background: P.text, color: '#fff', borderRadius: 6, fontSize: P.fontSize, fontWeight: 500, textDecoration: 'none', fontFamily: P.font, whiteSpace: 'nowrap' }}>Visit site</a> },
                { n: 2, title: 'Find a product to sell', desc: 'Browse their catalog — pick something with strong resell demand' },
                { n: 3, title: 'Copy the product URL', desc: 'Copy the URL from your browser address bar' },
              ].map((step, i) => (
                <div key={i} className="step-card" style={{ animation: `fadeUp .35s ease ${i * 0.07}s both` }}>
                  <div className="step-num">{step.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{step.desc}</div>
                  </div>
                  {step.action}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: `2px solid ${P.green}`, padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="step-num" style={{ background: P.green }}>4</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Paste the product URL to import</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>Onshipy scrapes title, price, images and variants instantly</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
                placeholder={`https://www.${embeddedBrand.name.toLowerCase().replace(/[^a-z]/g, '')}.com/products/...`}
                style={{ ...inp, flex: 1 }} />
              <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '7px 18px', background: importing || !importUrl ? P.bg : P.green, color: importing || !importUrl ? P.textSubdued : '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 600, cursor: importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily: P.font, whiteSpace: 'nowrap' }}>
                {importing ? 'Importing...' : 'Import product'}
              </button>
            </div>
            {importMsg && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: P.fontSize, background: importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color: importMsg.startsWith('error:') ? '#d82c0d' : '#006847', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
                {importMsg.startsWith('success:') && (
                  <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#006847', cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>View products</button>
                )}
              </div>
            )}
          </div>

          {nicheData && (
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Other {nicheData.label} brands</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {nicheData.brands.filter(b => b.name !== embeddedBrand.name).slice(0, 10).map((b, i) => (
                  <button key={i} onClick={() => openBrand(b)} style={{ padding: '5px 12px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 20, fontSize: P.fontSize, color: P.text, cursor: 'pointer', fontFamily: P.font, fontWeight: P.fontWeight, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }}/>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── Category grid ──────────────────────────────────────────────────────────
  if (!niche || !NICHES[niche]) {
    const filtered = search.trim()
      ? categories.filter(k => NICHES[k].label.toLowerCase().includes(search.toLowerCase()))
      : categories;

    return (
      <Layout title="Browse">
        <style>{`
          .cat-card { background:#fff; border-radius:14px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .18s,transform .18s; }
          .cat-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.1); transform:translateY(-2px); }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @media (max-width: 767px) {
            .browse-wrap { padding-left: 16px !important; padding-right: 16px !important; }
            .browse-search { width: 100% !important; }
            .browse-header { flex-direction: column !important; align-items: stretch !important; }
          }
        `}</style>

        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>

        <div className="browse-wrap" style={{ padding: '24px 24px 60px', maxWidth: 1160, margin: '0 auto' }}>

          {/* Header */}
          <div className="browse-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Browse brands</h1>
              <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Choose a category to discover top brands and import products directly</p>
            </div>
            {/* Search */}
            <div className="browse-search" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, padding: '0 12px', height: 34, width: 220 }}>
              <svg width="13" height="13" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter categories..." style={{ border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text, background: 'transparent', flex: 1 }} />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Categories', value: categories.length },
              { label: 'Total brands', value: Object.values(NICHES).reduce((s, n) => s + n.brands.length, 0) + '+' },
              { label: 'Trending now', value: Object.values(NICHES).reduce((s, n) => s + n.brands.filter(b => b.hot).length, 0) },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${P.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: P.text, letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
            {filtered.map((key, i) => {
              const n = NICHES[key];
              const hotCount = n.brands.filter(b => b.hot).length;
              return (
                <div key={key} className="cat-card" onClick={() => router.push(`/browse?niche=${key}`)}
                  style={{ animation: `fadeUp .38s ease ${i * 0.035}s both` }}>
                  {/* Colored banner */}
                  <div style={{ height: 80, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0) 70%)', pointerEvents: 'none' }}/>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon d={SVG[n.icon]} size={18} color="#fff" />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{n.label}</span>
                    </div>
                    {hotCount > 0 && (
                      <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '2px 7px' }}>
                        <Icon d={SVG.fire} size={10} color="rgba(255,200,0,0.9)" />
                        <span style={{ fontSize: '0.625rem', color: '#fff', fontWeight: 600 }}>{hotCount}</span>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{n.brands.length} brands</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{hotCount} trending</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: P.textSubdued, fontSize: P.fontSize }}>
              No categories match "{search}"
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── Niche view ─────────────────────────────────────────────────────────────
  const trending     = nicheData.brands.filter(b => b.hot);
  const currentTrend = trending[trendingSlide % trending.length];
  const filteredBrands = search
    ? nicheData.brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : nicheData.brands;

  return (
    <Layout title={`Browse — ${nicheData.label}`}>
      <style>{`
        .brand-card { background:#fff; border-radius:10px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .15s,transform .15s; }
        .brand-card:hover { box-shadow:0 4px 14px rgba(0,0,0,0.1); transform:translateY(-1px); }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .trend-slide { animation:fadeIn 0.45s ease; }
        @media (max-width: 767px) {
          .brand-wrap { padding-left: 16px !important; padding-right: 16px !important; }
          .brand-search { width: 100% !important; }
          .brand-header { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
      </div>

      <div className="brand-wrap" style={{ padding: '20px 24px 60px', maxWidth: 1160, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: P.fontSize, color: P.textSubdued }}>
          <button onClick={() => { setSearch(''); router.push('/browse'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.green, fontSize: P.fontSize, fontFamily: P.font, padding: 0, fontWeight: 500 }}>Browse</button>
          <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: P.text, fontWeight: 500 }}>{nicheData.label}</span>
        </div>

        {/* Heading row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: nicheData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={SVG[nicheData.icon]} size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{nicheData.label}</h1>
              <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Click any brand to view import instructions</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 20, fontSize: '0.75rem', color: P.textSubdued }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
            {trending.length} trending
          </div>
        </div>

        {/* Trending spotlight */}
        {currentTrend && (
          <div key={trendingSlide} className="trend-slide" style={{ background: currentTrend.color, borderRadius: 12, padding: '20px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative', minHeight: 96 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#69f0ae', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
                Trending now in {nicheData.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 3 }}>{currentTrend.name}</div>
              <div style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.65)' }}>High resell demand · Import ready</div>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
              <button onClick={() => openBrand(currentTrend)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, color: '#fff', fontSize: P.fontSize, fontWeight: 600, cursor: 'pointer', fontFamily: P.font }}>
                Browse {currentTrend.name}
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 16, display: 'flex', gap: 5 }}>
              {trending.map((_, i) => (
                <div key={i} onClick={() => setTrendingSlide(i)} style={{ width: i === trendingSlide % trending.length ? 16 : 6, height: 6, borderRadius: 3, background: i === trendingSlide % trending.length ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'width .3s' }}/>
              ))}
            </div>
          </div>
        )}

        {/* Import bar */}
        <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 8 }}>Import a product</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
              placeholder="Paste any product URL here..." style={inp} />
            <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '7px 16px', background: importing || !importUrl ? P.bg : P.text, color: importing || !importUrl ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily: P.font, whiteSpace: 'nowrap' }}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importMsg && (
            <div style={{ marginTop: 8, padding: '7px 12px', borderRadius: 8, fontSize: P.fontSize, background: importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color: importMsg.startsWith('error:') ? '#d82c0d' : '#006847', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
              {importMsg.startsWith('success:') && (
                <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#006847', cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>View products</button>
              )}
            </div>
          )}
        </div>

        {/* Top brands scroll rail */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d={SVG.fire} size={12} color={P.textSubdued} />
            Top {Math.min(10, nicheData.brands.length)} most resold
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {nicheData.brands.slice(0, 10).map((brand, i) => (
              <div key={i} onClick={() => openBrand(brand)} style={{ flexShrink: 0, width: 120, background: P.surface, borderRadius: 10, border: `1px solid ${P.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height: 60, background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.375rem', letterSpacing: '-0.03em' }}>{brand.name[0]}</span>
                  <div style={{ position: 'absolute', top: 4, left: 7, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>#{i + 1}</div>
                  {brand.hot && <div style={{ position: 'absolute', top: 4, right: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.5rem', fontWeight: 700, padding: '1px 5px', borderRadius: 8, letterSpacing: '0.05em' }}>HOT</div>}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 500, fontSize: '0.75rem', color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</div>
                  <div style={{ fontSize: '0.625rem', color: P.green, marginTop: 1, fontWeight: 500 }}>Browse</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All brands grid */}
        <div>
          <div className="brand-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              All brands ({nicheData.brands.length})
            </div>
            <div className="brand-search" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, padding: '0 10px', height: 30 }}>
              <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter brands..." style={{ border: 'none', outline: 'none', fontSize: '0.75rem', fontFamily: P.font, color: P.text, background: 'transparent', flex: 1, minWidth: 0 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 10 }}>
            {filteredBrands.map((brand, i) => (
              <div key={i} className="brand-card" onClick={() => openBrand(brand)}>
                <div style={{ height: 58, background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{brand.name[0]}</span>
                  {brand.hot && <div style={{ position: 'absolute', top: 4, right: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.5rem', fontWeight: 700, padding: '1px 5px', borderRadius: 8, letterSpacing: '0.05em' }}>HOT</div>}
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500, fontSize: '0.75rem', color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{brand.name}</div>
                  <svg width="11" height="11" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
          {filteredBrands.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: P.textSubdued, fontSize: P.fontSize }}>
              No brands match "{search}"
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
