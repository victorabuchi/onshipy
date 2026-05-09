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
  streetwear: {
    label: 'Streetwear', icon: 'fashion', color: '#111827',
    brands: [
      { name: 'Supreme',       url: 'https://www.supremenewyork.com',           color: '#e42b20', hot: true  },
      { name: 'Stussy',        url: 'https://www.stussy.com',                   color: '#000',    hot: true  },
      { name: 'Kith',          url: 'https://kith.com',                         color: '#1a1a1a', hot: true  },
      { name: 'Palace',        url: 'https://shop.palaceskateboards.com',       color: '#000',    hot: true  },
      { name: 'BAPE',          url: 'https://us.bape.com',                      color: '#4b5320', hot: true  },
      { name: 'Off-White',     url: 'https://www.off---white.com',              color: '#000',    hot: true  },
      { name: 'Carhartt WIP',  url: 'https://www.carhartt-wip.com',             color: '#3b3024', hot: true  },
      { name: 'Fear of God',   url: 'https://fearofgod.com',                    color: '#333',    hot: true  },
      { name: 'Madhappy',      url: 'https://madhappy.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Rhude',         url: 'https://rhude.com',                        color: '#1a1a1a', hot: true  },
      { name: 'Noah NYC',      url: 'https://noahny.com',                       color: '#1a1a1a', hot: false },
      { name: 'Brain Dead',    url: 'https://brain-dead.com',                   color: '#1a1a1a', hot: false },
      { name: 'Pleasures',     url: 'https://pleasures.us',                     color: '#1a1a1a', hot: false },
      { name: 'Aimé Leon Dore',url: 'https://www.aimeLeondore.com',             color: '#1a1a1a', hot: true  },
      { name: 'Anti Social Social Club', url: 'https://www.antisocialsocialclub.com', color: '#ff69b4', hot: true },
      { name: 'Billionaire Boys Club', url: 'https://www.bbcicecream.com',      color: '#003da5', hot: false },
      { name: 'Wacko Maria',   url: 'https://wackomaria.co.jp',                 color: '#1a1a1a', hot: false },
      { name: 'Neighborhood',  url: 'https://www.neighborhood.jp',              color: '#1a1a1a', hot: false },
      { name: 'Undercover',    url: 'https://www.undercoverism.com',            color: '#1a1a1a', hot: false },
      { name: 'Cactus Plant Flea Market', url: 'https://cpfm.xyz',              color: '#ff6600', hot: true  },
    ]
  },
  luxury: {
    label: 'Luxury', icon: 'bags', color: '#4b2e18',
    brands: [
      { name: 'Hermès',        url: 'https://www.hermes.com',                   color: '#e07000', hot: true  },
      { name: 'Chanel',        url: 'https://www.chanel.com',                   color: '#000',    hot: true  },
      { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com',             color: '#8b6914', hot: true  },
      { name: 'Dior',          url: 'https://www.dior.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Bottega Veneta',url: 'https://www.bottegaveneta.com',            color: '#5a3e28', hot: true  },
      { name: 'Celine',        url: 'https://www.celine.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Loewe',         url: 'https://www.loewe.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Valentino',     url: 'https://www.valentino.com',                color: '#c8102e', hot: true  },
      { name: 'Moncler',       url: 'https://www.moncler.com',                  color: '#1a1a1a', hot: true  },
      { name: 'The Row',       url: 'https://www.therow.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Loro Piana',    url: 'https://www.loropiana.com',                color: '#6a5a4d', hot: true  },
      { name: 'Brunello Cucinelli', url: 'https://www.brunellocucinelli.com',   color: '#6a5a4d', hot: true  },
      { name: 'Rick Owens',    url: 'https://www.rickowens.eu',                 color: '#1a1a1a', hot: true  },
      { name: 'Maison Margiela', url: 'https://www.maisonmargiela.com',         color: '#1a1a1a', hot: true  },
      { name: 'Toteme',        url: 'https://www.toteme-studio.com',            color: '#1a1a1a', hot: true  },
      { name: 'Jacquemus',     url: 'https://www.jacquemus.com',                color: '#1a1a1a', hot: true  },
      { name: 'Prada',         url: 'https://www.prada.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Gucci',         url: 'https://www.gucci.com',                    color: '#2c2c2c', hot: true  },
      { name: 'Cartier',       url: 'https://www.cartier.com',                  color: '#c8a882', hot: true  },
      { name: 'Givenchy',      url: 'https://www.givenchy.com',                 color: '#1a1a1a', hot: false },
    ]
  },
  jewelry: {
    label: 'Jewelry', icon: 'watches', color: '#a78bfa',
    brands: [
      { name: 'Pandora',       url: 'https://www.pandora.net',                  color: '#d4af37', hot: true  },
      { name: 'Swarovski',     url: 'https://www.swarovski.com',                color: '#c0c0c0', hot: true  },
      { name: 'Tiffany & Co.', url: 'https://www.tiffany.com',                  color: '#81d8d0', hot: true  },
      { name: 'Mejuri',        url: 'https://mejuri.com',                       color: '#b08d57', hot: true  },
      { name: 'Cartier',       url: 'https://www.cartier.com',                  color: '#c8a882', hot: true  },
      { name: 'Van Cleef & Arpels', url: 'https://www.vancleefarpels.com',      color: '#d4af37', hot: true  },
      { name: 'Monica Vinader',url: 'https://www.monicavinader.com',            color: '#c8a882', hot: true  },
      { name: 'Messika',       url: 'https://www.messika.com',                  color: '#d4af37', hot: true  },
      { name: 'APM Monaco',    url: 'https://www.apm.mc',                       color: '#c0c0c0', hot: true  },
      { name: 'Bulgari',       url: 'https://www.bulgari.com',                  color: '#d4af37', hot: false },
      { name: 'Chopard',       url: 'https://www.chopard.com',                  color: '#d4af37', hot: false },
      { name: 'David Yurman',  url: 'https://www.davidyurman.com',              color: '#1a1a1a', hot: false },
      { name: 'Mikimoto',      url: 'https://www.mikimoto.com',                 color: '#c0c0c0', hot: false },
      { name: 'Harry Winston',  url: 'https://www.harrywinston.com',            color: '#1a1a1a', hot: false },
      { name: 'Kendra Scott',  url: 'https://www.kendrascott.com',              color: '#d4af37', hot: true  },
      { name: 'Gorjana',       url: 'https://gorjana.com',                      color: '#d4af37', hot: false },
      { name: 'Jenny Bird',    url: 'https://jenny-bird.com',                   color: '#c8a882', hot: false },
      { name: 'Aurate',        url: 'https://auratenewyork.com',                color: '#d4af37', hot: false },
      { name: 'Ana Luisa',     url: 'https://www.analuisa.com',                 color: '#d4af37', hot: false },
      { name: 'Astley Clarke', url: 'https://www.astleyclarke.com',             color: '#1a1a1a', hot: false },
    ]
  },
  skincare: {
    label: 'Skincare', icon: 'beauty', color: '#db2777',
    brands: [
      { name: 'The Ordinary',  url: 'https://theordinary.com',                  color: '#1a1a1a', hot: true  },
      { name: 'La Roche-Posay',url: 'https://www.laroche-posay.com',            color: '#2563eb', hot: true  },
      { name: 'CeraVe',        url: 'https://www.cerave.com',                   color: '#1d4ed8', hot: true  },
      { name: "Paula's Choice",url: 'https://www.paulaschoice.com',             color: '#2e2e2e', hot: true  },
      { name: 'Tatcha',        url: 'https://www.tatcha.com',                   color: '#c2945a', hot: true  },
      { name: 'Drunk Elephant',url: 'https://www.drunkelephant.com',            color: '#f28c28', hot: true  },
      { name: 'Glow Recipe',   url: 'https://www.glowrecipe.com',               color: '#ff6b6b', hot: true  },
      { name: 'COSRX',         url: 'https://www.cosrx.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Sunday Riley',  url: 'https://sundayriley.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Laneige',       url: 'https://www.laneige.com',                  color: '#003da5', hot: true  },
      { name: 'Youth to the People', url: 'https://www.youthtothepeople.com',   color: '#22c55e', hot: true  },
      { name: 'Krave Beauty',  url: 'https://kravebeauty.com',                  color: '#f59e0b', hot: false },
      { name: 'Neutrogena',    url: 'https://www.neutrogena.com',               color: '#003da5', hot: false },
      { name: 'Cetaphil',      url: 'https://www.cetaphil.com',                 color: '#003da5', hot: false },
      { name: 'Innisfree',     url: 'https://www.innisfreeworld.com',           color: '#22c55e', hot: false },
      { name: 'Skinceuticals', url: 'https://www.skinceuticals.com',            color: '#1a1a1a', hot: false },
      { name: 'Dermalogica',   url: 'https://www.dermalogica.com',              color: '#1a1a1a', hot: false },
      { name: 'First Aid Beauty', url: 'https://www.firstaidbeauty.com',        color: '#e31837', hot: false },
      { name: 'Murad',         url: 'https://www.murad.com',                    color: '#003da5', hot: false },
      { name: 'Elemis',        url: 'https://www.elemis.com',                   color: '#1a1a1a', hot: false },
    ]
  },
  fragrance: {
    label: 'Fragrance', icon: 'beauty', color: '#be185d',
    brands: [
      { name: 'Byredo',        url: 'https://www.byredo.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Le Labo',       url: 'https://www.lelabofragrances.com',         color: '#1a1a1a', hot: true  },
      { name: 'Maison Francis Kurkdjian', url: 'https://www.franciskurkdjian.com', color: '#d4af37', hot: true },
      { name: 'Parfums de Marly', url: 'https://parfums-de-marly.com',          color: '#6b7280', hot: true  },
      { name: 'Creed',         url: 'https://www.creedfragrances.com',          color: '#d4af37', hot: true  },
      { name: 'Tom Ford',      url: 'https://www.tomfordbeauty.com',            color: '#1a1a1a', hot: true  },
      { name: 'Chanel Fragrance', url: 'https://www.chanel.com/fragrance',      color: '#000',    hot: true  },
      { name: 'Dior Fragrance',url: 'https://www.dior.com/fragrance',           color: '#1a1a1a', hot: true  },
      { name: 'Hermès Fragrance', url: 'https://www.hermes.com/fragrance',      color: '#e07000', hot: true  },
      { name: 'Diptyque',      url: 'https://www.diptyqueparis.com',            color: '#1a1a1a', hot: false },
      { name: 'Jo Malone',     url: 'https://www.jomalone.com',                 color: '#c8a882', hot: false },
      { name: 'Acqua di Parma',url: 'https://www.acquadiparma.com',             color: '#f59e0b', hot: false },
      { name: 'Viktor & Rolf', url: 'https://www.viktor-rolf.com',              color: '#1a1a1a', hot: false },
      { name: 'Guerlain',      url: 'https://www.guerlain.com',                 color: '#d4af37', hot: false },
      { name: 'Paco Rabanne',  url: 'https://www.pacorabanne.com',              color: '#d4af37', hot: false },
      { name: 'Carolina Herrera', url: 'https://www.carolinaherrera.com',       color: '#1a1a1a', hot: false },
      { name: 'Armani Beauty', url: 'https://www.giorgioarmanibeauty.com',      color: '#1a1a1a', hot: false },
      { name: 'Xerjoff',       url: 'https://www.xerjoff.com',                  color: '#d4af37', hot: false },
      { name: 'Amouage',       url: 'https://www.amouage.com',                  color: '#d4af37', hot: false },
      { name: "Penhaligon's",  url: 'https://www.penhaligons.com',              color: '#1a1a1a', hot: false },
    ]
  },
  outdoors: {
    label: 'Outdoors', icon: 'sports', color: '#166534',
    brands: [
      { name: 'The North Face',url: 'https://www.thenorthface.com',             color: '#e31837', hot: true  },
      { name: 'Patagonia',     url: 'https://www.patagonia.com',                color: '#1a5276', hot: true  },
      { name: "Arc'teryx",     url: 'https://arcteryx.com',                     color: '#111',    hot: true  },
      { name: 'Columbia',      url: 'https://www.columbia.com',                 color: '#003da5', hot: false },
      { name: 'Salomon',       url: 'https://www.salomon.com',                  color: '#000',    hot: true  },
      { name: 'Osprey',        url: 'https://www.osprey.com',                   color: '#e31837', hot: true  },
      { name: 'Black Diamond', url: 'https://www.blackdiamondequipment.com',    color: '#1a1a1a', hot: false },
      { name: 'Marmot',        url: 'https://www.marmot.com',                   color: '#c8102e', hot: false },
      { name: 'Fjallraven',    url: 'https://www.fjallraven.com',               color: '#c8102e', hot: true  },
      { name: 'Merrell',       url: 'https://www.merrell.com',                  color: '#c8a87a', hot: false },
      { name: 'Keen',          url: 'https://www.keenfootwear.com',             color: '#f59e0b', hot: false },
      { name: 'Smartwool',     url: 'https://www.smartwool.com',                color: '#c8102e', hot: false },
      { name: 'Berghaus',      url: 'https://www.berghaus.com',                 color: '#e31837', hot: false },
      { name: 'Rab',           url: 'https://rab.equipment',                    color: '#c8102e', hot: false },
      { name: 'MSR',           url: 'https://www.msrgear.com',                  color: '#e31837', hot: false },
      { name: 'Stanley',       url: 'https://www.stanley1913.com',              color: '#1a6b3a', hot: true  },
      { name: 'Yeti',          url: 'https://www.yeti.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Hydro Flask',   url: 'https://www.hydroflask.com',               color: '#0ea5e9', hot: true  },
      { name: 'Leatherman',    url: 'https://www.leatherman.com',               color: '#1a1a1a', hot: false },
      { name: 'Garmin Outdoor',url: 'https://www.garmin.com/outdoor',           color: '#007cc3', hot: false },
    ]
  },
  fitness: {
    label: 'Fitness', icon: 'sports', color: '#dc2626',
    brands: [
      { name: 'Gymshark',      url: 'https://www.gymshark.com',                 color: '#25262b', hot: true  },
      { name: 'Lululemon',     url: 'https://www.lululemon.com',                color: '#000',    hot: true  },
      { name: 'Alo Yoga',      url: 'https://www.aloyoga.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Vuori',         url: 'https://www.vuoriclothing.com',            color: '#3b5998', hot: true  },
      { name: 'Theragun',      url: 'https://www.therabody.com',                color: '#000',    hot: true  },
      { name: 'Hyperice',      url: 'https://hyperice.com',                     color: '#000',    hot: true  },
      { name: 'Peloton',       url: 'https://www.onepeloton.com',               color: '#cc0000', hot: true  },
      { name: 'NordicTrack',   url: 'https://www.nordictrack.com',              color: '#003da5', hot: false },
      { name: 'Bowflex',       url: 'https://www.bowflex.com',                  color: '#c8102e', hot: false },
      { name: 'TRX',           url: 'https://www.trxtraining.com',              color: '#c8102e', hot: false },
      { name: 'Rogue Fitness',  url: 'https://www.roguefitness.com',            color: '#c8102e', hot: true  },
      { name: 'Nobull',        url: 'https://www.nobullproject.com',            color: '#1a1a1a', hot: false },
      { name: 'WHOOP',         url: 'https://www.whoop.com',                    color: '#cc0000', hot: true  },
      { name: 'Oura Ring',     url: 'https://ouraring.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Garmin',        url: 'https://www.garmin.com',                   color: '#007cc3', hot: true  },
      { name: 'Manduka',       url: 'https://www.manduka.com',                  color: '#1a1a1a', hot: false },
      { name: 'Gaiam',         url: 'https://www.gaiam.com',                    color: '#22c55e', hot: false },
      { name: 'Sweaty Betty',  url: 'https://www.sweatybetty.com',              color: '#e8c5c1', hot: true  },
      { name: 'Fabletics',     url: 'https://www.fabletics.com',                color: '#1a1a1a', hot: false },
      { name: 'Girlfriend Collective', url: 'https://www.girlfriend.com',       color: '#e8c5c1', hot: false },
    ]
  },
  travel: {
    label: 'Travel', icon: 'bags', color: '#0369a1',
    brands: [
      { name: 'Away',          url: 'https://www.awaytravel.com',               color: '#111827', hot: true  },
      { name: 'Rimowa',        url: 'https://www.rimowa.com',                   color: '#9ca3af', hot: true  },
      { name: 'Tumi',          url: 'https://www.tumi.com',                     color: '#111827', hot: true  },
      { name: 'Samsonite',     url: 'https://www.samsonite.com',                color: '#1d4ed8', hot: false },
      { name: 'Osprey',        url: 'https://www.osprey.com',                   color: '#e31837', hot: true  },
      { name: 'Briggs & Riley',url: 'https://www.briggs-riley.com',             color: '#1a1a1a', hot: false },
      { name: 'Travelpro',     url: 'https://www.travelpro.com',                color: '#003da5', hot: false },
      { name: 'Victorinox',    url: 'https://www.victorinox.com',               color: '#cc0000', hot: false },
      { name: 'Delsey',        url: 'https://www.delsey.com',                   color: '#c8102e', hot: false },
      { name: 'Béis',          url: 'https://www.beisworld.com',                color: '#c8a882', hot: true  },
      { name: 'July',          url: 'https://www.july.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Calpak',        url: 'https://www.calpaktravel.com',             color: '#d4af37', hot: true  },
      { name: 'Horizn Studios',url: 'https://www.horizn-studios.com',           color: '#1a1a1a', hot: false },
      { name: 'Monos',         url: 'https://monos.com',                        color: '#1a1a1a', hot: true  },
      { name: 'Thule',         url: 'https://www.thule.com',                    color: '#003da5', hot: false },
      { name: 'Eagle Creek',   url: 'https://www.eaglecreek.com',               color: '#1a6b3a', hot: false },
      { name: 'Nomatic',       url: 'https://www.nomatic.com',                  color: '#1a1a1a', hot: false },
      { name: 'Paravel',       url: 'https://tourparavel.com',                  color: '#d4af37', hot: true  },
      { name: 'Herschel',      url: 'https://herschel.com',                     color: '#1a1a1a', hot: false },
      { name: 'Peak Design',   url: 'https://www.peakdesign.com',               color: '#1a1a1a', hot: true  },
    ]
  },
  music: {
    label: 'Music', icon: 'gaming', color: '#7c3aed',
    brands: [
      { name: 'Fender',        url: 'https://www.fender.com',                   color: '#c8102e', hot: true  },
      { name: 'Gibson',        url: 'https://www.gibson.com',                   color: '#c8102e', hot: true  },
      { name: 'Roland',        url: 'https://www.roland.com',                   color: '#003da5', hot: true  },
      { name: 'Yamaha',        url: 'https://www.yamaha.com',                   color: '#003da5', hot: true  },
      { name: 'Pioneer DJ',    url: 'https://www.pioneerdj.com',                color: '#c8102e', hot: true  },
      { name: 'Native Instruments', url: 'https://www.native-instruments.com',  color: '#1a1a1a', hot: true  },
      { name: 'Shure',         url: 'https://www.shure.com',                    color: '#003da5', hot: false },
      { name: 'Audio-Technica',url: 'https://www.audio-technica.com',           color: '#003da5', hot: false },
      { name: 'Rode',          url: 'https://rode.com',                         color: '#c8102e', hot: true  },
      { name: 'Focusrite',     url: 'https://focusrite.com',                    color: '#c8102e', hot: true  },
      { name: 'Beyerdynamic',  url: 'https://www.beyerdynamic.com',             color: '#003da5', hot: false },
      { name: 'Technics',      url: 'https://www.technics.com',                 color: '#000',    hot: true  },
      { name: 'Denon DJ',      url: 'https://www.denondj.com',                  color: '#c8102e', hot: false },
      { name: 'Korg',          url: 'https://www.korg.com',                     color: '#003da5', hot: false },
      { name: 'Zildjian',      url: 'https://zildjian.com',                     color: '#d4af37', hot: false },
      { name: 'Taylor Guitars',url: 'https://www.taylorguitars.com',            color: '#8b6914', hot: false },
      { name: 'DW Drums',      url: 'https://www.dwdrums.com',                  color: '#1a1a1a', hot: false },
      { name: 'Sennheiser Pro',url: 'https://en-us.sennheiser.com',             color: '#000',    hot: false },
      { name: 'Akai',          url: 'https://www.akaipro.com',                  color: '#c8102e', hot: false },
      { name: 'Novation',      url: 'https://novationmusic.com',                color: '#cc0000', hot: false },
    ]
  },
  photography: {
    label: 'Photography', icon: 'electronics', color: '#1e3a5f',
    brands: [
      { name: 'Sony Alpha',    url: 'https://www.sony.com/cameras',             color: '#000',    hot: true  },
      { name: 'Canon',         url: 'https://www.canon.com',                    color: '#bc0000', hot: true  },
      { name: 'Nikon',         url: 'https://www.nikon.com',                    color: '#ffd700', hot: false },
      { name: 'Fujifilm',      url: 'https://www.fujifilm.com',                 color: '#e31837', hot: true  },
      { name: 'Leica',         url: 'https://www.leica-camera.com',             color: '#c8102e', hot: true  },
      { name: 'DJI',           url: 'https://www.dji.com',                      color: '#1c1c1c', hot: true  },
      { name: 'Sigma',         url: 'https://www.sigma-global.com',             color: '#1a1a1a', hot: false },
      { name: 'Tamron',        url: 'https://www.tamron.com',                   color: '#003da5', hot: false },
      { name: 'Peak Design',   url: 'https://www.peakdesign.com',               color: '#1a1a1a', hot: true  },
      { name: 'Lowepro',       url: 'https://www.lowepro.com',                  color: '#c8102e', hot: false },
      { name: 'Manfrotto',     url: 'https://www.manfrotto.com',                color: '#c8102e', hot: false },
      { name: 'Godox',         url: 'https://www.godox.com',                    color: '#f59e0b', hot: true  },
      { name: 'Profoto',       url: 'https://profoto.com',                      color: '#1a1a1a', hot: false },
      { name: 'Zhiyun',        url: 'https://www.zhiyun-tech.com',              color: '#1a1a1a', hot: true  },
      { name: 'Moment',        url: 'https://www.shopmoment.com',               color: '#1a1a1a', hot: true  },
      { name: 'Sandisk',       url: 'https://www.westerndigital.com/sandisk',   color: '#cc0000', hot: false },
      { name: 'Lexar',         url: 'https://www.lexar.com',                    color: '#003da5', hot: false },
      { name: 'GoPro',         url: 'https://gopro.com',                        color: '#0f3d6b', hot: true  },
      { name: 'Insta360',      url: 'https://www.insta360.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Vanguard',      url: 'https://www.vanguardworld.com',            color: '#003da5', hot: false },
    ]
  },
  office: {
    label: 'Office & Work', icon: 'home', color: '#374151',
    brands: [
      { name: 'Herman Miller', url: 'https://www.hermanmiller.com',             color: '#c8102e', hot: true  },
      { name: 'Steelcase',     url: 'https://www.steelcase.com',                color: '#1d4ed8', hot: false },
      { name: 'Fully',         url: 'https://www.fully.com',                    color: '#1a6b3a', hot: true  },
      { name: 'Autonomous',    url: 'https://www.autonomous.ai',                color: '#1a1a1a', hot: true  },
      { name: 'Uplift Desk',   url: 'https://www.upliftdesk.com',               color: '#003da5', hot: true  },
      { name: 'Logitech MX',   url: 'https://www.logitech.com/mx',              color: '#00b3f0', hot: true  },
      { name: 'Apple Mac',     url: 'https://www.apple.com/mac',                color: '#1d1d1f', hot: true  },
      { name: 'LG Monitor',    url: 'https://www.lg.com/monitors',              color: '#a50034', hot: true  },
      { name: 'BenQ',          url: 'https://www.benq.com',                     color: '#003da5', hot: false },
      { name: 'Ergotron',      url: 'https://www.ergotron.com',                 color: '#003da5', hot: false },
      { name: 'Humanscale',    url: 'https://www.humanscale.com',               color: '#1a1a1a', hot: false },
      { name: 'Moleskine',     url: 'https://www.moleskine.com',                color: '#1a1a1a', hot: false },
      { name: 'Leuchtturm1917',url: 'https://www.leuchtturm1917.com',           color: '#1a1a1a', hot: false },
      { name: 'Lamy',          url: 'https://www.lamy.com',                     color: '#1a1a1a', hot: false },
      { name: 'Pilot',         url: 'https://www.pilotpen.us',                  color: '#003da5', hot: false },
      { name: 'Secretlab',     url: 'https://secretlab.co',                     color: '#1a1a1a', hot: true  },
      { name: 'Satechi',       url: 'https://satechi.net',                      color: '#1a1a1a', hot: true  },
      { name: 'Elgato',        url: 'https://www.elgato.com',                   color: '#1a1a1a', hot: true  },
      { name: 'Anker',         url: 'https://www.anker.com',                    color: '#00a0e9', hot: true  },
      { name: 'Branch',        url: 'https://www.branchfurniture.com',          color: '#1a1a1a', hot: false },
    ]
  },
  pets: {
    label: 'Pets', icon: 'home', color: '#d97706',
    brands: [
      { name: 'Kong',          url: 'https://www.kongcompany.com',              color: '#cc0000', hot: true  },
      { name: 'Orijen',        url: 'https://www.orijen.ca',                    color: '#1a6b3a', hot: true  },
      { name: 'Royal Canin',   url: 'https://www.royalcanin.com',               color: '#c8102e', hot: true  },
      { name: "Hill's Science Diet", url: 'https://www.hillspet.com',           color: '#003da5', hot: false },
      { name: 'Purina Pro Plan',url: 'https://www.purina.com/pro-plan',         color: '#c8102e', hot: true  },
      { name: 'Ruffwear',      url: 'https://www.ruffwear.com',                 color: '#e07000', hot: true  },
      { name: 'Hurtta',        url: 'https://www.hurtta.com',                   color: '#1a6b3a', hot: false },
      { name: 'Chuckit!',      url: 'https://www.chuckitball.com',              color: '#f59e0b', hot: false },
      { name: 'West Paw',      url: 'https://www.westpaw.com',                  color: '#22c55e', hot: false },
      { name: 'PetSafe',       url: 'https://www.petsafe.net',                  color: '#003da5', hot: false },
      { name: 'Furhaven',      url: 'https://www.furhaven.com',                 color: '#c8a882', hot: false },
      { name: 'Kurgo',         url: 'https://www.kurgo.com',                    color: '#003da5', hot: false },
      { name: "Burt's Bees Pet", url: 'https://www.burtsbees.com/pet',          color: '#f59e0b', hot: false },
      { name: 'Acana',         url: 'https://www.acana.com',                    color: '#1a6b3a', hot: false },
      { name: 'Natural Balance',url: 'https://www.naturalbalanceinc.com',       color: '#22c55e', hot: false },
      { name: 'Zuke\'s',       url: 'https://www.zukes.com',                    color: '#22c55e', hot: false },
      { name: 'Outward Hound', url: 'https://www.outwardhound.com',             color: '#f59e0b', hot: false },
      { name: 'Seresto',       url: 'https://www.seresto.com',                  color: '#003da5', hot: false },
      { name: 'Hyper Pet',     url: 'https://hyperpet.com',                     color: '#22c55e', hot: false },
      { name: 'Trixie',        url: 'https://www.trixie.de',                    color: '#003da5', hot: false },
    ]
  },
  baby: {
    label: 'Baby', icon: 'kids', color: '#db2777',
    brands: [
      { name: 'Bugaboo',       url: 'https://www.bugaboo.com',                  color: '#111827', hot: true  },
      { name: 'UPPAbaby',      url: 'https://uppababy.com',                     color: '#64748b', hot: true  },
      { name: 'Stokke',        url: 'https://www.stokke.com',                   color: '#dc2626', hot: true  },
      { name: 'Nuna',          url: 'https://nunababy.com',                     color: '#1f2937', hot: true  },
      { name: 'Ergobaby',      url: 'https://ergobaby.com',                     color: '#1a1a1a', hot: false },
      { name: 'Cybex',         url: 'https://www.cybex-online.com',             color: '#1a1a1a', hot: true  },
      { name: 'Doona',         url: 'https://www.doonaworld.com',               color: '#1a1a1a', hot: true  },
      { name: 'Maxi-Cosi',     url: 'https://www.maxicosi.com',                 color: '#003da5', hot: false },
      { name: 'Britax',        url: 'https://us.britax.com',                    color: '#003da5', hot: false },
      { name: 'Babyzen YOYO',  url: 'https://www.babyzen.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Silver Cross',  url: 'https://www.silvercross.com',              color: '#1a1a1a', hot: false },
      { name: 'Baby Bjorn',    url: 'https://www.babybjorn.com',                color: '#003da5', hot: false },
      { name: 'Owlet',         url: 'https://owletcare.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Nanit',         url: 'https://www.nanit.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Hatch',         url: 'https://www.hatch.co',                     color: '#e8c5c1', hot: true  },
      { name: '4moms',         url: 'https://www.4moms.com',                    color: '#003da5', hot: false },
      { name: 'Graco',         url: 'https://www.gracobaby.com',                color: '#003da5', hot: false },
      { name: 'Lovevery',      url: 'https://lovevery.com',                     color: '#22c55e', hot: true  },
      { name: 'Jellycat',      url: 'https://www.jellycat.com',                 color: '#f59e0b', hot: true  },
      { name: 'Skip Hop',      url: 'https://www.skiphop.com',                  color: '#f59e0b', hot: false },
    ]
  },
  cycling: {
    label: 'Cycling', icon: 'sports', color: '#0369a1',
    brands: [
      { name: 'Trek',          url: 'https://www.trekbikes.com',                color: '#e31837', hot: true  },
      { name: 'Specialized',   url: 'https://www.specialized.com',              color: '#e31837', hot: true  },
      { name: 'Giant',         url: 'https://www.giant-bicycles.com',           color: '#c8102e', hot: false },
      { name: 'Cannondale',    url: 'https://www.cannondale.com',               color: '#1d9a1d', hot: false },
      { name: 'Santa Cruz',    url: 'https://www.santacruzbicycles.com',        color: '#c8102e', hot: true  },
      { name: 'Rapha',         url: 'https://www.rapha.cc',                     color: '#c8102e', hot: true  },
      { name: 'Castelli',      url: 'https://www.castelli-cycling.com',         color: '#c8102e', hot: false },
      { name: 'Pearl Izumi',   url: 'https://www.pearlizumi.com',               color: '#003da5', hot: false },
      { name: 'Wahoo',         url: 'https://www.wahoofitness.com',             color: '#e31837', hot: true  },
      { name: 'Garmin Cycling',url: 'https://www.garmin.com/cycling',           color: '#007cc3', hot: true  },
      { name: 'Shimano',       url: 'https://www.shimano.com',                  color: '#003da5', hot: false },
      { name: 'SRAM',          url: 'https://www.sram.com',                     color: '#cc0000', hot: false },
      { name: 'Giro',          url: 'https://www.giro.com',                     color: '#003da5', hot: false },
      { name: 'Kask',          url: 'https://www.kask.com',                     color: '#c8102e', hot: false },
      { name: 'Assos',         url: 'https://www.assos.com',                    color: '#1a1a1a', hot: false },
      { name: 'Fizik',         url: 'https://www.fizik.com',                    color: '#1a1a1a', hot: false },
      { name: 'Bontrager',     url: 'https://www.bontrager.com',                color: '#e31837', hot: false },
      { name: 'Sportful',      url: 'https://www.sportful.com',                 color: '#003da5', hot: false },
      { name: 'Oakley Sport',  url: 'https://www.oakley.com',                   color: '#111',    hot: false },
      { name: 'Coros',         url: 'https://www.coros.com',                    color: '#003da5', hot: true  },
    ]
  },
  running: {
    label: 'Running', icon: 'sneakers', color: '#059669',
    brands: [
      { name: 'Hoka',          url: 'https://www.hoka.com',                     color: '#ff5f1f', hot: true  },
      { name: 'On Running',    url: 'https://www.on-running.com',               color: '#1a1a1a', hot: true  },
      { name: 'Brooks',        url: 'https://www.brooksrunning.com',            color: '#003da5', hot: true  },
      { name: 'New Balance',   url: 'https://www.newbalance.com',               color: '#cf0a2c', hot: true  },
      { name: 'Saucony',       url: 'https://www.saucony.com',                  color: '#005fb0', hot: true  },
      { name: 'ASICS',         url: 'https://www.asics.com',                    color: '#003da5', hot: false },
      { name: 'Nike Running',  url: 'https://www.nike.com/running',             color: '#111',    hot: true  },
      { name: 'Adidas Running',url: 'https://www.adidas.com/running',           color: '#000',    hot: true  },
      { name: 'Salomon',       url: 'https://www.salomon.com',                  color: '#000',    hot: false },
      { name: 'Altra',         url: 'https://www.altrarunning.com',             color: '#003da5', hot: false },
      { name: 'Inov-8',        url: 'https://www.inov-8.com',                   color: '#f59e0b', hot: false },
      { name: 'Garmin Running',url: 'https://www.garmin.com/running',           color: '#007cc3', hot: true  },
      { name: 'Coros',         url: 'https://www.coros.com',                    color: '#003da5', hot: true  },
      { name: 'Suunto',        url: 'https://www.suunto.com',                   color: '#c8102e', hot: false },
      { name: 'Polar',         url: 'https://www.polar.com',                    color: '#c8102e', hot: false },
      { name: 'Aftershokz',    url: 'https://www.aftershokz.com',               color: '#e07000', hot: false },
      { name: 'Balega',        url: 'https://www.balega.com',                   color: '#003da5', hot: false },
      { name: 'Darn Tough',    url: 'https://darntough.com',                    color: '#22c55e', hot: false },
      { name: 'Nathan Sports', url: 'https://www.nathansports.com',             color: '#f59e0b', hot: false },
      { name: 'Runderwear',    url: 'https://runderwear.com',                   color: '#1a1a1a', hot: false },
    ]
  },
  golf: {
    label: 'Golf', icon: 'sports', color: '#15803d',
    brands: [
      { name: 'Callaway',      url: 'https://www.callawaygolf.com',             color: '#003da5', hot: true  },
      { name: 'TaylorMade',    url: 'https://www.taylormadegolf.com',           color: '#003da5', hot: true  },
      { name: 'Titleist',      url: 'https://www.titleist.com',                 color: '#003da5', hot: true  },
      { name: 'Ping',          url: 'https://ping.com',                         color: '#003da5', hot: false },
      { name: 'Cobra Golf',    url: 'https://www.cobragolf.com',                color: '#ff6600', hot: false },
      { name: 'Cleveland Golf',url: 'https://www.clevelandgolf.com',            color: '#c8102e', hot: false },
      { name: 'Mizuno Golf',   url: 'https://www.mizunousa.com/golf',           color: '#003da5', hot: false },
      { name: 'FootJoy',       url: 'https://www.footjoy.com',                  color: '#003da5', hot: false },
      { name: 'Scotty Cameron',url: 'https://www.scottycameron.com',            color: '#1a1a1a', hot: true  },
      { name: 'Odyssey',       url: 'https://www.odysseygolf.com',              color: '#003da5', hot: false },
      { name: 'Bushnell Golf', url: 'https://www.bushnellgolf.com',             color: '#003da5', hot: true  },
      { name: 'Garmin Golf',   url: 'https://www.garmin.com/golf',              color: '#007cc3', hot: true  },
      { name: 'Arccos Golf',   url: 'https://www.arccosgolf.com',               color: '#1a6b3a', hot: true  },
      { name: 'Shot Scope',    url: 'https://www.shotscope.com',                color: '#003da5', hot: false },
      { name: 'Bridgestone Golf', url: 'https://www.bridgestonegolf.com',       color: '#003da5', hot: false },
      { name: 'Vokey',         url: 'https://www.vokey.com',                    color: '#003da5', hot: false },
      { name: 'Nike Golf',     url: 'https://www.nike.com/golf',                color: '#111',    hot: false },
      { name: 'Adidas Golf',   url: 'https://www.adidas.com/golf',              color: '#000',    hot: false },
      { name: 'Puma Golf',     url: 'https://www.puma.com/golf',                color: '#000',    hot: false },
      { name: 'Under Armour Golf', url: 'https://www.underarmour.com/golf',     color: '#1D1D1D', hot: false },
    ]
  },
  camping: {
    label: 'Camping', icon: 'outdoors', color: '#713f12',
    brands: [
      { name: 'REI Co-op',     url: 'https://www.rei.com',                      color: '#1a6b3a', hot: true  },
      { name: 'MSR',           url: 'https://www.msrgear.com',                  color: '#e31837', hot: false },
      { name: 'Big Agnes',     url: 'https://www.bigagnes.com',                 color: '#003da5', hot: false },
      { name: 'Sea to Summit', url: 'https://www.seatosummitusa.com',           color: '#003da5', hot: false },
      { name: 'Nemo Equipment',url: 'https://www.nemoequipment.com',            color: '#22c55e', hot: false },
      { name: 'Therm-a-Rest',  url: 'https://www.thermarest.com',               color: '#003da5', hot: false },
      { name: 'Snow Peak',     url: 'https://www.snowpeak.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Yeti',          url: 'https://www.yeti.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Stanley',       url: 'https://www.stanley1913.com',              color: '#1a6b3a', hot: true  },
      { name: 'Hydro Flask',   url: 'https://www.hydroflask.com',               color: '#0ea5e9', hot: true  },
      { name: 'Goal Zero',     url: 'https://www.goalzero.com',                 color: '#f59e0b', hot: true  },
      { name: 'BioLite',       url: 'https://www.bioliteenergy.com',            color: '#f59e0b', hot: true  },
      { name: 'Kelty',         url: 'https://www.kelty.com',                    color: '#003da5', hot: false },
      { name: 'Mountain Hardwear', url: 'https://www.mountainhardwear.com',     color: '#e31837', hot: false },
      { name: 'Osprey',        url: 'https://www.osprey.com',                   color: '#e31837', hot: true  },
      { name: 'Exped',         url: 'https://www.exped.com',                    color: '#003da5', hot: false },
      { name: 'Hilleberg',     url: 'https://www.hilleberg.com',                color: '#c8102e', hot: false },
      { name: 'Rab',           url: 'https://rab.equipment',                    color: '#c8102e', hot: false },
      { name: 'Black Diamond', url: 'https://www.blackdiamondequipment.com',    color: '#1a1a1a', hot: false },
      { name: 'Hyperlite Mountain Gear', url: 'https://www.hyperlitemountaingear.com', color: '#1a1a1a', hot: false },
    ]
  },
  surf: {
    label: 'Surf & Skate', icon: 'sports', color: '#0284c7',
    brands: [
      { name: 'Quiksilver',    url: 'https://www.quiksilver.com',               color: '#003da5', hot: true  },
      { name: 'Billabong',     url: 'https://www.billabong.com',                color: '#003da5', hot: true  },
      { name: 'Rip Curl',      url: 'https://www.ripcurl.com',                  color: '#c8102e', hot: true  },
      { name: 'Hurley',        url: 'https://www.hurley.com',                   color: '#1a1a1a', hot: false },
      { name: 'Volcom',        url: 'https://www.volcom.com',                   color: '#1a1a1a', hot: true  },
      { name: 'RVCA',          url: 'https://www.rvca.com',                     color: '#1a1a1a', hot: true  },
      { name: "O'Neill",       url: 'https://www.oneill.com',                   color: '#c8102e', hot: false },
      { name: 'Patagonia Surf',url: 'https://www.patagonia.com/surf',           color: '#1a5276', hot: false },
      { name: 'Dakine',        url: 'https://www.dakine.com',                   color: '#003da5', hot: false },
      { name: 'FCS',           url: 'https://www.fcs.com.au',                   color: '#003da5', hot: false },
      { name: 'Firewire',      url: 'https://www.firewiresurfboards.com',       color: '#003da5', hot: false },
      { name: 'Channel Islands', url: 'https://www.cisurfboards.com',           color: '#003da5', hot: false },
      { name: 'Globe',         url: 'https://www.globe.tv',                     color: '#1a1a1a', hot: false },
      { name: 'Vissla',        url: 'https://www.vissla.com',                   color: '#1a5276', hot: false },
      { name: 'Vans Surf',     url: 'https://www.vans.com/surf',                color: '#e31837', hot: false },
      { name: 'Nixon',         url: 'https://www.nixon.com',                    color: '#1a1a1a', hot: false },
      { name: 'Santa Cruz Skate', url: 'https://www.santacruzskateboards.com',  color: '#c8102e', hot: true  },
      { name: 'Thrasher',      url: 'https://www.thrashermagazine.com',         color: '#e31837', hot: true  },
      { name: 'Independent Trucks', url: 'https://www.independenttrucks.com',   color: '#cc0000', hot: false },
      { name: 'Spitfire Wheels', url: 'https://www.spitfirewheels.com',         color: '#e31837', hot: false },
    ]
  },
  sunglasses: {
    label: 'Sunglasses', icon: 'watches', color: '#92400e',
    brands: [
      { name: 'Ray-Ban',       url: 'https://www.ray-ban.com',                  color: '#cc0000', hot: true  },
      { name: 'Oakley',        url: 'https://www.oakley.com',                   color: '#111',    hot: true  },
      { name: 'Gentle Monster',url: 'https://www.gentlemonster.com',            color: '#1a1a1a', hot: true  },
      { name: 'Persol',        url: 'https://www.persol.com',                   color: '#8b6914', hot: false },
      { name: 'Maui Jim',      url: 'https://www.mauijim.com',                  color: '#003da5', hot: false },
      { name: 'Tom Ford Eyewear', url: 'https://www.tomford.com/eyewear',       color: '#1a1a1a', hot: true  },
      { name: 'Prada Eyewear', url: 'https://www.prada.com/eyewear',            color: '#1a1a1a', hot: true  },
      { name: 'Dior Eyewear',  url: 'https://www.dior.com/eyewear',             color: '#1a1a1a', hot: true  },
      { name: 'Gucci Eyewear', url: 'https://www.gucci.com/eyewear',            color: '#2c2c2c', hot: true  },
      { name: 'Bottega Veneta Eyewear', url: 'https://www.bottegaveneta.com/eyewear', color: '#5a3e28', hot: true },
      { name: 'Celine Eyewear',url: 'https://www.celine.com/eyewear',           color: '#1a1a1a', hot: true  },
      { name: 'Oliver Peoples',url: 'https://www.oliverpeoples.com',            color: '#1a1a1a', hot: false },
      { name: 'Mykita',        url: 'https://www.mykita.com',                   color: '#1a1a1a', hot: false },
      { name: 'Moscot',        url: 'https://www.moscot.com',                   color: '#8b6914', hot: false },
      { name: 'Garrett Leight',url: 'https://www.garrettleight.com',            color: '#1a1a1a', hot: false },
      { name: 'Warby Parker',  url: 'https://www.warbyparker.com',              color: '#003da5', hot: true  },
      { name: 'Diff Eyewear',  url: 'https://www.diffeyewear.com',              color: '#1a1a1a', hot: false },
      { name: 'Meller',        url: 'https://mellereyewear.com',                color: '#1a1a1a', hot: false },
      { name: 'Le Specs',      url: 'https://www.lespecs.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Vogue Eyewear', url: 'https://www.vogueeyewear.com',             color: '#c8102e', hot: false },
    ]
  },
  techAccessories: {
    label: 'Tech Accessories', icon: 'electronics', color: '#6d28d9',
    brands: [
      { name: 'Anker',         url: 'https://www.anker.com',                    color: '#00a0e9', hot: true  },
      { name: 'Spigen',        url: 'https://www.spigen.com',                   color: '#1a1a1a', hot: true  },
      { name: 'OtterBox',      url: 'https://www.otterbox.com',                 color: '#003da5', hot: true  },
      { name: 'Casetify',      url: 'https://www.casetify.com',                 color: '#1a1a1a', hot: true  },
      { name: 'dbrand',        url: 'https://dbrand.com',                       color: '#cc0000', hot: true  },
      { name: 'Nomad Goods',   url: 'https://www.nomadgoods.com',               color: '#8b6914', hot: true  },
      { name: 'Peak Design Mobile', url: 'https://www.peakdesign.com/mobile',   color: '#1a1a1a', hot: true  },
      { name: 'mophie',        url: 'https://www.mophie.com',                   color: '#1a1a1a', hot: false },
      { name: 'Twelve South',  url: 'https://www.twelvesouth.com',              color: '#1a1a1a', hot: false },
      { name: 'Belkin',        url: 'https://www.belkin.com',                   color: '#003da5', hot: false },
      { name: 'Satechi',       url: 'https://satechi.net',                      color: '#1a1a1a', hot: true  },
      { name: 'HyperDrive',    url: 'https://www.hypershop.com',                color: '#003da5', hot: false },
      { name: 'ESR',           url: 'https://www.esrgear.com',                  color: '#003da5', hot: false },
      { name: 'ZAGG',          url: 'https://www.zagg.com',                     color: '#003da5', hot: false },
      { name: 'Moft',          url: 'https://www.moft.us',                      color: '#1a1a1a', hot: true  },
      { name: 'Quad Lock',     url: 'https://www.quadlockcase.com',             color: '#003da5', hot: true  },
      { name: 'PopSockets',    url: 'https://www.popsockets.com',               color: '#1a1a1a', hot: false },
      { name: 'Moment Phone',  url: 'https://www.shopmoment.com',               color: '#1a1a1a', hot: false },
      { name: 'Razer Mobile',  url: 'https://www.razer.com/mobile',             color: '#00d900', hot: false },
      { name: 'Apple MagSafe', url: 'https://www.apple.com/magsafe',            color: '#1d1d1f', hot: true  },
    ]
  },
  swimwear: {
    label: 'Swimwear', icon: 'sports', color: '#0891b2',
    brands: [
      { name: 'Speedo',        url: 'https://www.speedo.com',                   color: '#003da5', hot: true  },
      { name: 'Arena',         url: 'https://www.arenawaterinstinct.com',       color: '#003da5', hot: false },
      { name: 'Seafolly',      url: 'https://www.seafolly.com',                 color: '#0ea5e9', hot: true  },
      { name: 'Triangl',       url: 'https://www.triangl.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Solid & Striped', url: 'https://solidandstriped.com',            color: '#003da5', hot: true  },
      { name: 'Frankies Bikinis', url: 'https://frankiesbikinis.com',           color: '#f59e0b', hot: true  },
      { name: 'L*Space',       url: 'https://www.lspace.com',                   color: '#1a1a1a', hot: false },
      { name: 'Billabong',     url: 'https://www.billabong.com',                color: '#003da5', hot: false },
      { name: 'Rip Curl',      url: 'https://www.ripcurl.com',                  color: '#c8102e', hot: false },
      { name: 'Vilebrequin',   url: 'https://www.vilebrequin.com',              color: '#003da5', hot: true  },
      { name: 'Orlebar Brown', url: 'https://www.orlebarbrown.com',             color: '#003da5', hot: true  },
      { name: 'Heidi Klein',   url: 'https://www.heidi-klein.com',              color: '#1a1a1a', hot: false },
      { name: 'Melissa Odabash', url: 'https://www.odabash.com',                color: '#1a1a1a', hot: false },
      { name: 'Eres',          url: 'https://www.eres.fr',                      color: '#1a1a1a', hot: false },
      { name: 'La Blanca',     url: 'https://www.lablanca.com',                 color: '#003da5', hot: false },
      { name: 'Vitamin A',     url: 'https://www.vitaminaswim.com',             color: '#e07000', hot: false },
      { name: 'TYR',           url: 'https://www.tyr.com',                      color: '#c8102e', hot: false },
      { name: 'Nike Swim',     url: 'https://www.nike.com/swimming',            color: '#111',    hot: false },
      { name: 'Adidas Swim',   url: 'https://www.adidas.com/swimming',          color: '#000',    hot: false },
      { name: 'PQ Swim',       url: 'https://www.pqswim.com',                   color: '#0ea5e9', hot: false },
    ]
  },
  denim: {
    label: 'Denim', icon: 'fashion', color: '#1e40af',
    brands: [
      { name: "Levi's",        url: 'https://www.levis.com',                    color: '#c8102e', hot: true  },
      { name: 'A.P.C. Denim',  url: 'https://www.apc.fr',                       color: '#1a1a1a', hot: true  },
      { name: 'Nudie Jeans',   url: 'https://www.nudiejeans.com',               color: '#1a1a1a', hot: true  },
      { name: 'Acne Studios Denim', url: 'https://www.acnestudios.com',         color: '#333',    hot: true  },
      { name: 'Frame',         url: 'https://www.frame-store.com',              color: '#1a1a1a', hot: true  },
      { name: 'AG Jeans',      url: 'https://www.agjeans.com',                  color: '#1a1a1a', hot: false },
      { name: 'Madewell',      url: 'https://www.madewell.com',                 color: '#003da5', hot: true  },
      { name: 'Citizens of Humanity', url: 'https://citizensofhumanity.com',    color: '#1a1a1a', hot: false },
      { name: '7 For All Mankind', url: 'https://www.7forallmankind.com',       color: '#003da5', hot: false },
      { name: 'G-Star Raw',    url: 'https://www.g-star.com',                   color: '#1a1a1a', hot: false },
      { name: 'Wrangler',      url: 'https://www.wrangler.com',                 color: '#003da5', hot: false },
      { name: 'Lee',           url: 'https://www.lee.com',                      color: '#003da5', hot: false },
      { name: 'Edwin',         url: 'https://www.edwinjeans.com',               color: '#1a1a1a', hot: false },
      { name: 'Evisu',         url: 'https://evisu.com',                        color: '#003da5', hot: false },
      { name: 'Diesel',        url: 'https://www.diesel.com',                   color: '#1a1a1a', hot: false },
      { name: 'Replay',        url: 'https://www.replay.it',                    color: '#c8102e', hot: false },
      { name: 'Mother Denim',  url: 'https://www.motherdenim.com',              color: '#1a1a1a', hot: true  },
      { name: 'Khaite',        url: 'https://khaite.com',                       color: '#1a1a1a', hot: true  },
      { name: 'True Religion', url: 'https://www.truereligion.com',             color: '#003da5', hot: false },
      { name: 'Pepe Jeans',    url: 'https://www.pepejeans.com',                color: '#003da5', hot: false },
    ]
  },
  menswear: {
    label: 'Menswear', icon: 'fashion', color: '#1e293b',
    brands: [
      { name: 'Suitsupply',    url: 'https://www.suitsupply.com',               color: '#1a1a1a', hot: true  },
      { name: 'Hugo Boss',     url: 'https://www.hugoboss.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Paul Smith',    url: 'https://www.paulsmith.com',                color: '#1a1a1a', hot: true  },
      { name: 'Ted Baker',     url: 'https://www.tedbaker.com',                 color: '#1a1a1a', hot: false },
      { name: 'Reiss',         url: 'https://www.reiss.com',                    color: '#1a1a1a', hot: true  },
      { name: 'Sunspel',       url: 'https://www.sunspel.com',                  color: '#1a1a1a', hot: false },
      { name: "Drake's",       url: 'https://www.drakes.com',                   color: '#8b6914', hot: false },
      { name: 'Eton Shirts',   url: 'https://www.etonshirts.com',               color: '#1a1a1a', hot: false },
      { name: 'Oliver Spencer',url: 'https://www.oliverspencer.co.uk',          color: '#1a1a1a', hot: false },
      { name: 'Private White V.C.', url: 'https://www.privatewhitevc.com',      color: '#1a1a1a', hot: false },
      { name: 'Orlebar Brown', url: 'https://www.orlebarbrown.com',             color: '#003da5', hot: true  },
      { name: 'Tom Ford Menswear', url: 'https://www.tomford.com/men',          color: '#1a1a1a', hot: true  },
      { name: 'Brunello Cucinelli', url: 'https://www.brunellocucinelli.com',   color: '#6a5a4d', hot: true  },
      { name: 'Boglioli',      url: 'https://www.boglioli.it',                  color: '#1a1a1a', hot: false },
      { name: 'Canali',        url: 'https://www.canali.com',                   color: '#1a1a1a', hot: false },
      { name: 'Turnbull & Asser', url: 'https://www.turnbullandasser.com',      color: '#1a1a1a', hot: false },
      { name: 'Charles Tyrwhitt', url: 'https://www.ctshirts.com',              color: '#003da5', hot: true  },
      { name: 'Moss',          url: 'https://www.moss.co.uk',                   color: '#1a1a1a', hot: false },
      { name: 'M.J. Bale',     url: 'https://www.mjbale.com',                   color: '#1a1a1a', hot: false },
      { name: 'Hawes & Curtis',url: 'https://www.hawesandcurtis.com',           color: '#003da5', hot: false },
    ]
  },
  womenswear: {
    label: 'Womenswear', icon: 'fashion', color: '#be185d',
    brands: [
      { name: 'Reformation',   url: 'https://www.thereformation.com',           color: '#1a1a1a', hot: true  },
      { name: 'Ganni',         url: 'https://www.ganni.com',                    color: '#000',    hot: true  },
      { name: 'Sandro',        url: 'https://www.sandro-paris.com',             color: '#1a1a1a', hot: true  },
      { name: 'Maje',          url: 'https://www.maje.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Rag & Bone',    url: 'https://www.rag-bone.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Theory',        url: 'https://www.theory.com',                   color: '#1a1a1a', hot: false },
      { name: 'Reiss',         url: 'https://www.reiss.com',                    color: '#1a1a1a', hot: false },
      { name: 'Ba&sh',         url: 'https://www.ba-sh.com',                    color: '#1a1a1a', hot: true  },
      { name: 'The Frankie Shop', url: 'https://www.thefrankieshop.com',        color: '#1a1a1a', hot: true  },
      { name: 'Staud',         url: 'https://www.staud.clothing',               color: '#1a1a1a', hot: true  },
      { name: 'Rotate Birger Christensen', url: 'https://rotatebirgerchristensen.com', color: '#1a1a1a', hot: true },
      { name: 'Ulla Johnson',  url: 'https://www.ullajohnson.com',              color: '#1a1a1a', hot: false },
      { name: 'Veronica Beard',url: 'https://www.veronicabeard.com',            color: '#1a1a1a', hot: false },
      { name: 'Self-Portrait', url: 'https://www.self-portrait-studio.com',     color: '#1a1a1a', hot: true  },
      { name: 'L.K. Bennett',  url: 'https://www.lkbennett.com',                color: '#1a1a1a', hot: false },
      { name: 'Whistles',      url: 'https://www.whistles.com',                 color: '#1a1a1a', hot: false },
      { name: 'Me+Em',         url: 'https://www.meandem.com',                  color: '#1a1a1a', hot: false },
      { name: 'Roksanda',      url: 'https://www.roksanda.com',                 color: '#1a1a1a', hot: false },
      { name: 'Mara Hoffman',  url: 'https://www.marahoffman.com',              color: '#22c55e', hot: false },
      { name: 'Loveshackfancy',url: 'https://loveshackfancy.com',               color: '#e8c5c1', hot: true  },
    ]
  },
  sustainability: {
    label: 'Sustainable', icon: 'food', color: '#166534',
    brands: [
      { name: 'Patagonia',     url: 'https://www.patagonia.com',                color: '#1a5276', hot: true  },
      { name: 'Stella McCartney', url: 'https://www.stellamccartney.com',       color: '#1a1a1a', hot: true  },
      { name: 'Veja',          url: 'https://www.veja-store.com',               color: '#1a1a1a', hot: true  },
      { name: 'Allbirds',      url: 'https://www.allbirds.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Pangaia',       url: 'https://thepangaia.com',                   color: '#1a6b3a', hot: true  },
      { name: 'Girlfriend Collective', url: 'https://www.girlfriend.com',       color: '#e8c5c1', hot: true  },
      { name: 'Eileen Fisher', url: 'https://www.eileenfisher.com',             color: '#1a1a1a', hot: false },
      { name: 'Outerknown',    url: 'https://www.outerknown.com',               color: '#1a5276', hot: false },
      { name: 'People Tree',   url: 'https://www.peopletree.co.uk',             color: '#22c55e', hot: false },
      { name: 'Tentree',       url: 'https://www.tentree.com',                  color: '#22c55e', hot: false },
      { name: 'Amour Vert',    url: 'https://amourvert.com',                    color: '#22c55e', hot: false },
      { name: 'Pact',          url: 'https://wearpact.com',                     color: '#22c55e', hot: false },
      { name: 'Everlane',      url: 'https://www.everlane.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Christy Dawn',  url: 'https://www.christydawn.com',              color: '#e8c5c1', hot: false },
      { name: 'Wolven',        url: 'https://www.wolven.com',                   color: '#22c55e', hot: false },
      { name: 'Thought Clothing', url: 'https://www.wearethought.com',          color: '#22c55e', hot: false },
      { name: 'Rapanui',       url: 'https://rapanuiclothing.com',              color: '#22c55e', hot: false },
      { name: 'Armedangels',   url: 'https://www.armedangels.com',              color: '#22c55e', hot: false },
      { name: 'Colorful Standard', url: 'https://colorfulstandard.com',         color: '#1a1a1a', hot: true  },
      { name: 'Stanley/Stella',url: 'https://www.stanleystellaworld.com',       color: '#1a1a1a', hot: false },
    ]
  },
  resale: {
    label: 'Resale & Vintage', icon: 'fire', color: '#b45309',
    brands: [
      { name: 'StockX',        url: 'https://stockx.com',                       color: '#00872a', hot: true  },
      { name: 'GOAT',          url: 'https://www.goat.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Grailed',       url: 'https://www.grailed.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Depop',         url: 'https://www.depop.com',                    color: '#e31837', hot: true  },
      { name: 'Vestiaire Collective', url: 'https://www.vestiairecollective.com', color: '#1a1a1a', hot: true },
      { name: 'The RealReal',  url: 'https://www.therealreal.com',              color: '#1a1a1a', hot: true  },
      { name: 'Stadium Goods', url: 'https://www.stadiumgoods.com',             color: '#1a1a1a', hot: true  },
      { name: 'Flight Club',   url: 'https://www.flightclub.com',               color: '#c8102e', hot: true  },
      { name: 'Farfetch',      url: 'https://www.farfetch.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Rebag',         url: 'https://www.rebag.com',                    color: '#1a1a1a', hot: false },
      { name: 'Fashionphile',  url: 'https://www.fashionphile.com',             color: '#1a1a1a', hot: false },
      { name: 'Chrono24',      url: 'https://www.chrono24.com',                 color: '#003da5', hot: true  },
      { name: 'Watchfinder',   url: 'https://www.watchfinder.com',              color: '#1a1a1a', hot: false },
      { name: 'Poshmark',      url: 'https://poshmark.com',                     color: '#c8102e', hot: true  },
      { name: 'Vinted',        url: 'https://www.vinted.com',                   color: '#1a6b3a', hot: true  },
      { name: 'Mercari',       url: 'https://www.mercari.com',                  color: '#c8102e', hot: true  },
      { name: 'ThredUP',       url: 'https://www.thredup.com',                  color: '#22c55e', hot: false },
      { name: 'Swap.com',      url: 'https://www.swap.com',                     color: '#22c55e', hot: false },
      { name: 'eBay Authenticated', url: 'https://www.ebay.com/authenticity-guarantee', color: '#e53238', hot: false },
      { name: '1stDibs',       url: 'https://www.1stdibs.com',                  color: '#1a1a1a', hot: false },
    ]
  },
  stationery: {
    label: 'Stationery', icon: 'home', color: '#7c3aed',
    brands: [
      { name: 'Moleskine',     url: 'https://www.moleskine.com',                color: '#1a1a1a', hot: true  },
      { name: 'Leuchtturm1917',url: 'https://www.leuchtturm1917.com',           color: '#1a1a1a', hot: true  },
      { name: 'Rhodia',        url: 'https://www.rhodia.com',                   color: '#e31837', hot: false },
      { name: 'Clairefontaine',url: 'https://www.clairefontaine.com',           color: '#003da5', hot: false },
      { name: 'Muji Stationery', url: 'https://www.muji.com/stationery',        color: '#1a1a1a', hot: true  },
      { name: 'Lamy',          url: 'https://www.lamy.com',                     color: '#1a1a1a', hot: true  },
      { name: 'Pilot',         url: 'https://www.pilotpen.us',                  color: '#003da5', hot: false },
      { name: 'Uni Mitsubishi',url: 'https://www.uniball-na.com',               color: '#003da5', hot: false },
      { name: 'Zebra Pens',    url: 'https://www.zebrapen.com',                 color: '#1a1a1a', hot: false },
      { name: 'Staedtler',     url: 'https://www.staedtler.com',                color: '#003da5', hot: false },
      { name: 'Faber-Castell', url: 'https://www.faber-castell.com',            color: '#1a6b3a', hot: false },
      { name: "Caran d'Ache",  url: 'https://www.carandache.com',               color: '#cc0000', hot: false },
      { name: 'Tombow',        url: 'https://www.tombowusa.com',                color: '#cc0000', hot: false },
      { name: 'Sakura',        url: 'https://www.sakuraofamerica.com',          color: '#e8c5c1', hot: false },
      { name: 'Midori',        url: 'https://www.midori-japan.co.jp',           color: '#1a6b3a', hot: true  },
      { name: 'Field Notes',   url: 'https://fieldnotesbrand.com',              color: '#f59e0b', hot: false },
      { name: 'Appointed',     url: 'https://www.appointed.co',                 color: '#1a1a1a', hot: false },
      { name: 'Baron Fig',     url: 'https://www.baronfig.com',                 color: '#1a1a1a', hot: false },
      { name: 'Rifle Paper Co.', url: 'https://riflepaperco.com',               color: '#be185d', hot: true  },
      { name: 'Papier',        url: 'https://www.papier.com',                   color: '#1a1a1a', hot: true  },
    ]
  },
  cooking: {
    label: 'Cooking', icon: 'food', color: '#c2410c',
    brands: [
      { name: 'Le Creuset',    url: 'https://www.lecreuset.com',                color: '#dc2626', hot: true  },
      { name: 'Staub',         url: 'https://www.staub-online.com',             color: '#1a1a1a', hot: true  },
      { name: 'All-Clad',      url: 'https://www.all-clad.com',                 color: '#1a1a1a', hot: true  },
      { name: 'KitchenAid',    url: 'https://www.kitchenaid.com',               color: '#dc2626', hot: true  },
      { name: 'Instant Pot',   url: 'https://www.instantpot.com',               color: '#003da5', hot: true  },
      { name: 'Ninja',         url: 'https://www.ninjakitchen.com',             color: '#111',    hot: true  },
      { name: 'Our Place',     url: 'https://fromourplace.com',                 color: '#f59e0b', hot: true  },
      { name: 'Caraway',       url: 'https://www.carawayhome.com',              color: '#0f766e', hot: true  },
      { name: 'HexClad',       url: 'https://hexclad.com',                      color: '#111827', hot: true  },
      { name: 'Lodge',         url: 'https://www.lodgecastiron.com',            color: '#1a1a1a', hot: false },
      { name: 'Zwilling',      url: 'https://www.zwilling.com',                 color: '#1a1a1a', hot: false },
      { name: 'Wusthof',       url: 'https://www.wusthof.com',                  color: '#cc0000', hot: false },
      { name: 'Global Knives', url: 'https://www.globalknives.uk',              color: '#1a1a1a', hot: false },
      { name: 'OXO',           url: 'https://www.oxo.com',                      color: '#1a1a1a', hot: false },
      { name: 'Breville',      url: 'https://www.breville.com',                 color: '#cc0000', hot: true  },
      { name: 'Anova',         url: 'https://anovaculinary.com',                color: '#003da5', hot: true  },
      { name: 'Cuisinart',     url: 'https://www.cuisinart.com',                color: '#1a1a1a', hot: false },
      { name: 'Vitamix',       url: 'https://www.vitamix.com',                  color: '#c8102e', hot: true  },
      { name: 'Thermomix',     url: 'https://www.thermomix.com',                color: '#cc0000', hot: false },
      { name: 'De\'Longhi',    url: 'https://www.delonghi.com',                 color: '#cc0000', hot: true  },
    ]
  },
  coffee: {
    label: 'Coffee & Tea', icon: 'food', color: '#78350f',
    brands: [
      { name: 'Nespresso',     url: 'https://www.nespresso.com',                color: '#1a1a1a', hot: true  },
      { name: 'De\'Longhi',    url: 'https://www.delonghi.com',                 color: '#cc0000', hot: true  },
      { name: 'Breville',      url: 'https://www.breville.com',                 color: '#cc0000', hot: true  },
      { name: 'Fellow',        url: 'https://fellowproducts.com',               color: '#1a1a1a', hot: true  },
      { name: 'Baratza',       url: 'https://www.baratza.com',                  color: '#1a1a1a', hot: false },
      { name: 'Jura',          url: 'https://www.jura.com',                     color: '#003da5', hot: false },
      { name: 'La Marzocco',   url: 'https://home.lamarzocco.com',              color: '#cc0000', hot: true  },
      { name: 'Hario',         url: 'https://www.hario.co.jp',                  color: '#cc0000', hot: false },
      { name: 'Chemex',        url: 'https://www.chemexcoffeemaker.com',        color: '#1a1a1a', hot: false },
      { name: 'AeroPress',     url: 'https://aeropress.com',                    color: '#f59e0b', hot: true  },
      { name: 'Kinto',         url: 'https://kinto.co',                         color: '#1a1a1a', hot: true  },
      { name: 'Acaia',         url: 'https://acaia.co',                         color: '#1a1a1a', hot: false },
      { name: 'Lelit',         url: 'https://www.lelit.com',                    color: '#c8102e', hot: false },
      { name: 'Rancilio',      url: 'https://www.ranciliogroup.com',            color: '#cc0000', hot: false },
      { name: 'Wilfa',         url: 'https://www.wilfa.com',                    color: '#1a1a1a', hot: false },
      { name: 'Sage Appliances', url: 'https://www.sageappliances.com',         color: '#cc0000', hot: true  },
      { name: 'Moccamaster',   url: 'https://us.moccamaster.com',               color: '#c8102e', hot: false },
      { name: 'Weber Workshops', url: 'https://weberworkshops.com',             color: '#1a1a1a', hot: false },
      { name: 'Whittard',      url: 'https://www.whittard.co.uk',               color: '#1a3a1a', hot: false },
      { name: 'Fortnum & Mason', url: 'https://www.fortnumandmason.com',        color: '#6b4226', hot: false },
    ]
  },
  haircare: {
    label: 'Hair Care', icon: 'beauty', color: '#c026d3',
    brands: [
      { name: 'Dyson Hair',    url: 'https://www.dyson.com/hair-care',          color: '#C41230', hot: true  },
      { name: 'GHD',           url: 'https://www.ghdhair.com',                  color: '#000',    hot: true  },
      { name: 'Olaplex',       url: 'https://olaplex.com',                      color: '#d4af37', hot: true  },
      { name: 'Kerastase',     url: 'https://www.kerastase.com',                color: '#c8a882', hot: true  },
      { name: 'Moroccanoil',   url: 'https://www.moroccanoil.com',              color: '#0f766e', hot: true  },
      { name: 'Redken',        url: 'https://www.redken.com',                   color: '#cc0000', hot: false },
      { name: 'Wella',         url: 'https://www.wella.com',                    color: '#1a1a1a', hot: false },
      { name: 'L\'Oreal Professionnel', url: 'https://www.lorealprofessionnel.com', color: '#c8102e', hot: false },
      { name: 'Pureology',     url: 'https://www.pureology.com',                color: '#7c3aed', hot: false },
      { name: 'Paul Mitchell', url: 'https://paulmitchell.com',                 color: '#000',    hot: false },
      { name: 'T3',            url: 'https://www.t3micro.com',                  color: '#1a1a1a', hot: true  },
      { name: 'Babyliss',      url: 'https://www.babyliss.co.uk',               color: '#c8102e', hot: false },
      { name: 'Cloud Nine',    url: 'https://www.cloudninehair.com',            color: '#7c3aed', hot: false },
      { name: 'Revlon Professional', url: 'https://www.revlon.com/professional', color: '#c8102e', hot: false },
      { name: 'Matrix',        url: 'https://www.matrix.com',                   color: '#003da5', hot: false },
      { name: 'Briogeo',       url: 'https://www.briogeohair.com',              color: '#f59e0b', hot: false },
      { name: 'Verb',          url: 'https://myverbproducts.com',               color: '#22c55e', hot: false },
      { name: 'Prose',         url: 'https://prose.com',                        color: '#1a1a1a', hot: true  },
      { name: 'Function of Beauty', url: 'https://www.functionofbeauty.com',    color: '#e8c5c1', hot: true  },
      { name: 'Curlsmith',     url: 'https://www.curlsmith.com',                color: '#f59e0b', hot: false },
    ]
  },
  automotive: {
    label: 'Automotive', icon: 'sports', color: '#1e293b',
    brands: [
      { name: "Meguiar's",     url: 'https://www.meguiars.com',                 color: '#003da5', hot: true  },
      { name: 'Chemical Guys',  url: 'https://www.chemicalguys.com',            color: '#1a6b3a', hot: true  },
      { name: "Adam's Polishes", url: 'https://adamspolishes.com',              color: '#cc0000', hot: true  },
      { name: 'Gtechniq',      url: 'https://gtechniq.com',                     color: '#003da5', hot: true  },
      { name: 'CarPro',        url: 'https://www.carpro-us.com',                color: '#cc0000', hot: false },
      { name: 'Armor All',     url: 'https://www.armorall.com',                 color: '#cc0000', hot: false },
      { name: 'Turtle Wax',    url: 'https://www.turtlewax.com',                color: '#1a1a1a', hot: false },
      { name: 'WeatherTech',   url: 'https://www.weathertech.com',              color: '#1a1a1a', hot: true  },
      { name: 'Garmin GPS',    url: 'https://www.garmin.com/automotive',        color: '#007cc3', hot: true  },
      { name: 'Blackvue',      url: 'https://www.blackvue.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Nextbase',      url: 'https://www.nextbase.com',                 color: '#003da5', hot: true  },
      { name: 'Thule Roof',    url: 'https://www.thule.com/racks',              color: '#003da5', hot: false },
      { name: 'Yakima',        url: 'https://www.yakima.com',                   color: '#c8102e', hot: false },
      { name: 'K&N',           url: 'https://www.knfilters.com',                color: '#cc0000', hot: false },
      { name: 'Brembo',        url: 'https://www.brembo.com',                   color: '#cc0000', hot: false },
      { name: 'Recaro',        url: 'https://www.recaro-automotive.com',        color: '#cc0000', hot: false },
      { name: 'Sparco',        url: 'https://www.sparco.it',                    color: '#cc0000', hot: false },
      { name: 'Mothers',       url: 'https://www.mothers.com',                  color: '#003da5', hot: false },
      { name: 'Gyeon',         url: 'https://www.gyeon.eu',                     color: '#1a1a1a', hot: false },
      { name: 'Koch-Chemie',   url: 'https://www.koch-chemie.de',               color: '#e31837', hot: false },
    ]
  },
  anime: {
    label: 'Anime & Manga', icon: 'kids', color: '#e11d48',
    brands: [
      { name: 'Good Smile Company', url: 'https://www.goodsmile.info',          color: '#1a1a1a', hot: true  },
      { name: 'Bandai Namco',  url: 'https://www.bandai.com',                   color: '#003da5', hot: true  },
      { name: 'Kotobukiya',    url: 'https://kotobukiya.co.jp',                 color: '#cc0000', hot: true  },
      { name: 'Medicom Toy',   url: 'https://www.medicomtoy.co.jp',             color: '#1a1a1a', hot: true  },
      { name: 'Aniplex',       url: 'https://www.aniplex.co.jp',                color: '#cc0000', hot: true  },
      { name: 'Crunchyroll Store', url: 'https://store.crunchyroll.com',        color: '#f59e0b', hot: true  },
      { name: 'Uniqlo UT',     url: 'https://www.uniqlo.com/ut',                color: '#e40012', hot: true  },
      { name: 'Tokyo Otaku Mode', url: 'https://otakumode.com',                 color: '#003da5', hot: false },
      { name: 'AmiAmi',        url: 'https://www.amiami.com',                   color: '#1a1a1a', hot: false },
      { name: 'Solaris Japan', url: 'https://solarisjapan.com',                 color: '#003da5', hot: false },
      { name: 'J-List',        url: 'https://www.jlist.com',                    color: '#cc0000', hot: false },
      { name: 'Hobby Japan',   url: 'https://www.hobbyjapan.co.jp',             color: '#cc0000', hot: false },
      { name: 'Mandarake',     url: 'https://www.mandarake.co.jp',              color: '#1a1a1a', hot: true  },
      { name: 'Right Stuf Anime', url: 'https://www.rightstufanime.com',        color: '#003da5', hot: false },
      { name: 'Viz Media',     url: 'https://www.viz.com',                      color: '#cc0000', hot: false },
      { name: 'Yen Press',     url: 'https://yenpress.com',                     color: '#f59e0b', hot: false },
      { name: 'Funimation',    url: 'https://www.funimation.com',               color: '#003da5', hot: false },
      { name: 'MAFEX',         url: 'https://www.medicomtoy.co.jp/mafex',       color: '#1a1a1a', hot: false },
      { name: 'Tamashii Nations', url: 'https://tamashii.jp',                   color: '#cc0000', hot: true  },
      { name: 'Max Factory',   url: 'https://www.maxfactory.jp',                color: '#1a1a1a', hot: false },
    ]
  },
  collectibles: {
    label: 'Collectibles', icon: 'fire', color: '#ea580c',
    brands: [
      { name: 'Funko Pop',     url: 'https://www.funko.com',                    color: '#e31e24', hot: true  },
      { name: 'Pokémon Center',url: 'https://www.pokemoncenter.com',            color: '#facc15', hot: true  },
      { name: 'LEGO Sets',     url: 'https://www.lego.com',                     color: '#e3000b', hot: true  },
      { name: 'Hot Wheels Collector', url: 'https://hotwheels.mattel.com',      color: '#e31e24', hot: true  },
      { name: 'Magic: The Gathering', url: 'https://magic.wizards.com',         color: '#7c3aed', hot: true  },
      { name: 'Sideshow Collectibles', url: 'https://www.sideshowtoy.com',      color: '#1a1a1a', hot: true  },
      { name: 'Hot Toys',      url: 'https://www.hottoys.com.hk',              color: '#1a1a1a', hot: true  },
      { name: 'Gentle Giant',  url: 'https://www.gentlegiant.com',              color: '#003da5', hot: false },
      { name: 'NECA',          url: 'https://www.necaonline.com',               color: '#1a1a1a', hot: false },
      { name: 'McFarlane Toys',url: 'https://www.mcfarlane.com',               color: '#003da5', hot: false },
      { name: 'Hasbro Pulse',  url: 'https://www.hasbropulse.com',             color: '#003087', hot: true  },
      { name: 'Mezco',         url: 'https://www.mezcotoyz.com',                color: '#1a1a1a', hot: false },
      { name: 'Chronicle Collectibles', url: 'https://www.chroniclecollectibles.com', color: '#1a1a1a', hot: false },
      { name: 'First 4 Figures',url: 'https://www.first4figures.com',           color: '#003da5', hot: false },
      { name: 'Kidrobot',      url: 'https://www.kidrobot.com',                 color: '#e31837', hot: false },
      { name: 'Medicom Toy',   url: 'https://www.medicomtoy.co.jp',             color: '#1a1a1a', hot: true  },
      { name: 'Bearbrick',     url: 'https://www.medicomtoy.co.jp/bearbrick',   color: '#1a1a1a', hot: true  },
      { name: 'Kaws',          url: 'https://kawsone.com',                      color: '#1a1a1a', hot: true  },
      { name: 'Daniel Arsham', url: 'https://danielarsham.com',                 color: '#1a1a1a', hot: true  },
      { name: 'Superplastic',  url: 'https://www.superplastic.co',              color: '#f59e0b', hot: true  },
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
