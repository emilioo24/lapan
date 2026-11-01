// Datos reales del negocio. No agregar datos que no estén confirmados por el cliente.

export const RESTO = {
  nombre: 'Lapan',
  instagram: { usuario: '@lapan_parana', url: 'https://www.instagram.com/lapan_parana/', seguidores: '55,4 mil' },
  direccion: 'San Lorenzo 9, Paraná, Entre Ríos',
  horario: {
    corto: 'Mar a Dom · 8 a 00 h',
    largo: 'Martes a domingo, de 8:00 a 00:00, de corrido',
    invierno: 'En invierno, de 8:00 a 23:00',
    cerrado: 'Lunes cerrado',
  },
  whatsapp: { numero: '343 407-6364', url: 'https://wa.link/tpzfxo' },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lapan+San+Lorenzo+9+Paran%C3%A1',
  mapsEmbed: 'https://www.google.com/maps?q=Lapan+San+Lorenzo+9+Paran%C3%A1&output=embed',
  puntajes: {
    google: { valor: 4.6, texto: '4,6', opiniones: 'unas 4.666 opiniones' },
    tripadvisor: { valor: 4.5, texto: '4,5', ranking: 'N.º 2 de los lugares de postres de Paraná' },
  },
  precio: 'De $10.000 a $20.000 por persona',
};

export const ALMACEN = {
  nombre: 'Lapan Almacén',
  instagram: { usuario: '@lapan_almacen', url: 'https://www.instagram.com/lapan_almacen/', seguidores: '10,3 mil' },
  horario: {
    corto: 'Lun a Sáb · 9 a 20:30 h',
    largo: 'Lunes a sábado, de 9:00 a 20:30, de corrido',
  },
  delivery: 'De 9:00 a 13:00 y de 16:00 a 20:00',
  whatsapp: { url: 'https://wa.link/uvosyp' },
};
