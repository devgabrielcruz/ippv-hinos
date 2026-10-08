(function () {
  const MANANCIAL = "Igreja Presbiteriana Manancial de Natal";
  const SALTERIO = "Saltério Reformado";
  const CANTE = "Cante com a Gente";

  const salmos = [
    { title: "Salmo 1", subtitle: "Milad 3 Água Viva (1995)", youtubeUrl: "https://youtu.be/8E48BFKXd0w" },
    { title: "Salmo 2A", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/EDAYwPv9lfE?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 3B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/K3suQxyPL-A?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 8C", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/4Dt4z09aLgU?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 11B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/3OTfvgHY3JA?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 15B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://www.youtube.com/watch?v=TDdJF8lRazE" },
    { title: "Salmo 16B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/LMTDXgxnYn8?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 19B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/HSPc7DP2Mf0?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 24B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/rT4GEpDx57o?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 32", subtitle: "Confissão (Ao Vivo)", youtubeUrl: "https://youtu.be/2H3VSEMj0lY" },
    { title: "Salmo 40B · estrofes 1–4", subtitle: MANANCIAL, youtubeUrl: "https://youtu.be/eJJe-_RwG2w?si=II7oASD-owKlMkkP" },
    { title: "Salmo 40B · estrofes 5–7", subtitle: MANANCIAL, youtubeUrl: "https://youtu.be/eJJe-_RwG2w?si=II7oASD-owKlMkkP" },
    { title: "Salmo 46", subtitle: "Cantado · " + SALTERIO, youtubeUrl: "https://youtu.be/zu4Wj5YJJ0c" },
    { title: "Salmo 50", subtitle: SALTERIO, youtubeUrl: "https://youtu.be/SP4Nu0La5mk" },
    { title: "Salmo 51", subtitle: SALTERIO, youtubeUrl: "https://youtu.be/CUWdx6u6CkY" },
    { title: "Salmo 63", subtitle: "Os Meus Lábios Te Louvam, Pt. 1 (Ao Vivo)", youtubeUrl: "https://youtu.be/eEYZCVv_hnc?list=OLAK5uy_kephB5XpL40MFgYdB_J4qGKgjzdQdeHJ0" },
    { title: "Salmo 84", subtitle: "Teus Altares", youtubeUrl: "https://youtu.be/-YsdPQtjkuo" },
    { title: "Salmo 93B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/8OUZhvb0810?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 96", subtitle: "Cantai ao Senhor", youtubeUrl: "https://youtu.be/i1uEBjy_jjk" },
    { title: "Salmo 103C · estrofes 1–5", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/UhgoomrNm_Q?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 103C · estrofes 6–9", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/UhgoomrNm_Q?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 104", subtitle: CANTE, youtubeUrl: "https://youtu.be/_qwDs67ModM" },
    { title: "Salmo 113B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/3Z9iNZs_BqQ?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 115B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://youtu.be/mRnLG5TsObI?list=PL0RfeI_K3OkLR0FoYSWTqedt7bXmpEdik" },
    { title: "Salmo 116B", subtitle: MANANCIAL + " · v1.0", youtubeUrl: "https://youtu.be/0nsPOpZYYSg?list=PL0RfeI_K3OkIEKB4LYWHcRy-B8l40V4h9" },
    { title: "Salmo 117B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://youtu.be/zEjaAofT5bQ" },
    { title: "Salmo 119", subtitle: "Lâmpada para os Meus Pés (Ao Vivo)", youtubeUrl: "https://youtu.be/f_VxbpLChd8?list=OLAK5uy_kephB5XpL40MFgYdB_J4qGKgjzdQdeHJ0" },
    { title: "Salmo 121B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://youtu.be/7vRlxLArEUc?list=PL0RfeI_K3OkLR0FoYSWTqedt7bXmpEdik" },
    { title: "Salmo 122", youtubeUrl: "https://www.youtube.com/watch?v=7hF06cLsMcw" },
    { title: "Salmo 128B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://youtu.be/Mg19rQW1FS4?list=PL0RfeI_K3OkLR0FoYSWTqedt7bXmpEdik" },
    { title: "Salmo 131B", subtitle: MANANCIAL + " · v2.0", youtubeUrl: "https://youtu.be/HBwh89kINJI?list=PL0RfeI_K3OkLR0FoYSWTqedt7bXmpEdik" },
    { title: "Salmo 148", subtitle: CANTE, youtubeUrl: "https://youtu.be/tePfhUBM4kQ" }
  ].map((t) => ({ ...t, group: "Salmos" }));

  const canticos = [
    { title: "Abundante Graça", subtitle: "Daniel Souza (Ao Vivo)", youtubeUrl: "https://youtu.be/gV5-N-GQ8CY" },
    { title: "Bendizei a Deus", subtitle: "Rev. Iclayber Alves", youtubeUrl: "https://youtu.be/cx4d4ai2ClI" },
    { title: "Canção da Esperança", youtubeUrl: "https://youtu.be/RuZBnQEhkNY" },
    { title: "Canção do Apocalipse", subtitle: "Ao Vivo", youtubeUrl: "https://youtu.be/nqZunX8XoLg" },
    { title: "Cheguemo-nos Pois", subtitle: "Cláudio Claro", youtubeUrl: "https://youtu.be/Gw-tTQBM93E" },
    { title: "Cordeiro que Sofreu", subtitle: "Red Music", youtubeUrl: "https://youtu.be/iQW6csQa9w0" },
    { title: "Deus de Esplendor", subtitle: "Manga", youtubeUrl: "https://youtu.be/P0IP-B00YEs" },
    { title: "Deus, Somente Deus", youtubeUrl: "https://youtu.be/9FoIGDOxBzY" },
    { title: "Deus Supremo És", subtitle: "Ministério de Adoração e Louvor", youtubeUrl: "https://youtu.be/Vw0l2vC7_fc" },
    { title: "Ele Tem Feito Maravilhas", subtitle: "Cláudio Claro", youtubeUrl: "https://youtu.be/gtLZ_01iQOU" },
    { title: "Glória", subtitle: "Hillsong · versão PIPR", youtubeUrl: "https://youtu.be/3N-Ks5PQ4Vo" },
    { title: "Glória Pra Sempre", subtitle: "Vencedores por Cristo", youtubeUrl: "https://youtu.be/Pk7MGoPjpTs" },
    { title: "Graças Dou", subtitle: "Don Moen · versão IP Pedras Vivas", youtubeUrl: "https://www.youtube.com/watch?v=Arp_NbB-oG8" },
    { title: "Jesus, o Herdeiro", subtitle: "Daniel Souza", youtubeUrl: "https://youtu.be/y-VcGGMGSYU" },
    { title: "Jesus, o Rei da Glória", youtubeUrl: "https://youtu.be/FpvQum5rjI8" },
    { title: "Jesus Tornou-se Homem", subtitle: "Daniel Souza", youtubeUrl: "https://youtu.be/k8v7JqPK7-Y?list=PLUIn76qK9frlG7MB7L02So_hHBQ8LEI3i" },
    { title: "Isaías 53", subtitle: "Projeto Sola", youtubeUrl: "https://youtu.be/g7zA1L96-pU" },
    { title: "Louvemos ao Senhor", subtitle: "Adhemar de Campos", youtubeUrl: "https://youtu.be/oPtl04tnMhs" },
    { title: "Majestade", subtitle: "Anuacy Fontes · versão IPG", youtubeUrl: "https://youtu.be/q7wm6yNDYk8" },
    { title: "Messias de Israel", subtitle: "Cláudio Claro (Ao Vivo)", youtubeUrl: "https://youtu.be/NNBjXaRF0fM" },
    { title: "O Verbo", subtitle: "Daniel Lüdtke (Ao Vivo)", youtubeUrl: "https://youtu.be/Ri750STzvew" },
    { title: "Perante o Trono do Alto Céu", subtitle: CANTE, youtubeUrl: "https://youtu.be/xMgmia5dKp0" },
    { title: "Rei das Nações", subtitle: "Apocalipse 15:2-4 (Ao Vivo)", youtubeUrl: "https://youtu.be/HhOf7Ri6hqE" },
    { title: "Salvador Maravilhoso", subtitle: "Gerson Borges", youtubeUrl: "https://youtu.be/w4xiKYnqFoc" },
    { title: "Teu Santo Nome", subtitle: "Adoradores 1", youtubeUrl: "https://youtu.be/D6JFogr276w" },
    { title: "Tua Senhor é a Grandeza", subtitle: "Ao Vivo", youtubeUrl: "https://youtu.be/2afyqeh9cPI" },
    { title: "Tudo é Jesus pra Mim", subtitle: "Sovereign Grace Music", youtubeUrl: "https://youtu.be/kjo8-PtCENE" }
  ].map((t) => ({ ...t, group: "Cânticos" }));

  const hnc = [
    ["003", "A Igreja em Adoração", "3jQjw5XXFMg"],
    ["006", "Doxologia", "BbAhwGGK8mM"],
    ["010", "A Criação e Seu Criador", "dzoJKpfF_tc"],
    ["011", "Trindade Santíssima", "NwMUSHiyANg"],
    ["014", "Louvor", "Jyk7GMvS34g"],
    ["016", "Louvor ao Deus Soberano", "70gYQU27YsQ"],
    ["018", "Deus dos Antigos", "YsQC-TVFDn0"],
    ["019", "Rei Sublime", "MYzirz_4bEQ"],
    ["021", "Louvor ao Deus de Abraão", "wFl6KMqVbqE"],
    ["028", "Coroação", "PbMpv7cAu9k"],
    ["033", "Maravilhas Divinas", "4RTYNaIJPwc"],
    ["038", "Louvores sem Fim", "KZDgLz3P8dI"],
    ["042", "O Grande Amor de Deus", "_D4sxndn7sw"],
    ["047", "Louvor e Glória", "7XcdubCuuvs"],
    ["049", "Sempre Vencendo", "nVS4Gf7yFTM"],
    ["062", "Hino de Gratidão", "AkwN_j2K1XE"],
    ["063", "As Muitas Bênçãos", "3-DEJfuupUY"],
    ["067", "Coração Quebrantado", "SsdsqGuIGnY"],
    ["068", "Necessidade", "OegTF4MwleE"],
    ["071", "Contrição e Confissão", "bVqrieY8vRk"],
    ["093", "Firmeza na Fé", "pzocY5NSdWw"],
    ["104", "Linda Melodia", "gpLx3Ai1DVY"],
    ["110-A", "Crer e Observar", "ggc0D0_pvK8"],
    ["114", "Brilho Celeste", "1esDNX3U918"],
    ["120", "Dependência", "Ui2N5KqwBYM"],
    ["127", "Hora Bendita", "qdIITP7CFMY"],
    ["128", "Comunhão Preciosa", "0bSscp4q2sg"],
    ["135", "Mais de Cristo", "uxqm67Ezyd8"],
    ["144", "Segurança e Alegria", "8B_wbW3UNr8"],
    ["177", "Firme nas Promessas", "nbQjtxWWd6M"],
    ["222", "Mais Perto da Cruz", "wtEn4E0wO_s"],
    ["266", "Rude Cruz", "xCNZ1uhwljI"],
    ["269", "Pureza no Sangue de Cristo", "gKjg5T-kg_4"],
    ["297", "A Chamada Final", "0QPjEXYt8hk"],
    ["299", "Renovação", "jJmMgo2Tlpw"]
  ].map(([num, title, id]) => ({
    title,
    subtitle: "HNC " + num,
    group: "Hinário Novo Cântico",
    youtubeUrl: "https://www.youtube.com/watch?v=" + id
  }));

  window.PLAYLIST_CONFIG = {
    title: "Salmos, Cânticos e Hinos",
    items: [...salmos, ...canticos, ...hnc]
  };
})();
