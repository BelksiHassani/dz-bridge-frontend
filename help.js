/* DZ-Bridge · contextual help panel, shared by every screen except index.html.
   Adds a "?" button next to the theme toggle (#themeBtn) and opens a side panel whose content follows
   the current page, hash route (dashboards) or wizard step (profiles, auth). Press "?" to open it from anywhere.
   Any element with [data-help] also opens it (e.g. "Help center" in the dashboard sidebars).
   Language comes from <html lang>; the panel re-renders when the page switches language.
   Content lives in HELP below: one entry per screen, each in en / fr / ar. */
(function(){
'use strict';

var SUPPORT='support@dz-bridge.dz';

var UI={
  en:{btn:'Help',kick:'Help',how:'How this page works',flow:'The steps',here:'You are here',faq:'Common questions',
      stuck:'Still need help?',stuckS:'Write to the DZ-Bridge team and tell us which page you were on.',mail:'Email support',
      key:'Tip: press ? to open help from any page.',close:'Close help',subj:'Help'},
  fr:{btn:'Aide',kick:'Aide',how:'Comment fonctionne cette page',flow:'Les étapes',here:'Vous êtes ici',faq:'Questions fréquentes',
      stuck:'Besoin d’aide supplémentaire ?',stuckS:'Écrivez à l’équipe DZ-Bridge en précisant la page où vous étiez.',mail:'Écrire au support',
      key:'Astuce : appuyez sur ? pour ouvrir l’aide depuis n’importe quelle page.',close:'Fermer l’aide',subj:'Aide'},
  ar:{btn:'مساعدة',kick:'مساعدة',how:'كيف تعمل هذه الصفحة',flow:'الخطوات',here:'أنت هنا',faq:'أسئلة شائعة',
      stuck:'هل تحتاج إلى مساعدة إضافية؟',stuckS:'راسل فريق DZ-Bridge وأخبرنا بالصفحة التي كنت فيها.',mail:'راسل الدعم',
      key:'نصيحة: اضغط على ? لفتح المساعدة من أي صفحة.',close:'إغلاق المساعدة',subj:'مساعدة'}
};

/* t: title · i: intro · s: tips (string) or steps ([title, text]) · q: [question, answer] · flow: s is a sequence with a current step */
var HELP={

/* ---------- organization dashboard ---------- */
'org.dashboard':{
  en:{t:'Dashboard',i:'Your organization at a glance: projects, matches and expert visits near you.',
    s:['The figures at the top track your projects, matches and pending feedback.','Active projects shows each project’s status and the next step to take.','Upcoming expert visits lists experts coming to your region. Click Invite to propose one of your projects.'],
    q:[['How long does matching take?','Matched experts usually arrive within 7 days of submitting a project.'],['Why do experts appear as numbers?','Experts stay anonymous (Expert #…) until they accept your invitation. Their name and contact details are shared after that.']]},
  fr:{t:'Tableau de bord',i:'Votre organisation en un coup d’œil : projets, correspondances et visites d’experts près de chez vous.',
    s:['Les chiffres en haut suivent vos projets, vos correspondances et les avis en attente.','Projets actifs indique le statut de chaque projet et la prochaine étape.','Visites d’experts à venir liste les experts qui viennent dans votre région. Cliquez sur Inviter pour leur proposer un de vos projets.'],
    q:[['Combien de temps prend la mise en relation ?','Les experts correspondants arrivent en général sous 7 jours après la soumission d’un projet.'],['Pourquoi les experts apparaissent-ils sous forme de numéros ?','Les experts restent anonymes (Expert n° …) jusqu’à ce qu’ils acceptent votre invitation. Leur nom et leurs coordonnées sont partagés ensuite.']]},
  ar:{t:'لوحة التحكم',i:'نظرة سريعة على مؤسستك: المشاريع والمطابقات وزيارات الخبراء القريبة منك.',
    s:['تتابع الأرقام في الأعلى مشاريعك ومطابقاتك والتقييمات المنتظرة.','يعرض قسم المشاريع النشطة حالة كل مشروع والخطوة التالية.','تعرض زيارات الخبراء القادمة الخبراء الذين سيزورون منطقتك. انقر على «دعوة» لتقترح عليهم أحد مشاريعك.'],
    q:[['كم تستغرق المطابقة؟','يصل الخبراء المطابَقون عادةً خلال 7 أيام من تقديم المشروع.'],['لماذا يظهر الخبراء بأرقام؟','يبقى الخبراء مجهولي الهوية (خبير رقم …) حتى يقبلوا دعوتك، ثم يُشارك اسمهم وبيانات اتصالهم.']]}
},
'org.projects':{
  en:{t:'Projects',i:'Every project you have drafted or submitted, with its status.',
    s:['Use the tabs to switch between drafts, active and completed projects.','Search by title or by PRJ code.','Open a project to see its matched experts and progress. Drafts reopen where you left off.'],
    q:[['How do I reuse a past project?','Open it and click Duplicate. A new draft is created that you can change freely.'],['What does “Under review” mean?','DZ-Bridge is checking the project and running the matching. Matched experts usually arrive within 7 days.']]},
  fr:{t:'Projets',i:'Tous les projets que vous avez rédigés ou soumis, avec leur statut.',
    s:['Utilisez les onglets pour passer des brouillons aux projets actifs ou terminés.','Recherchez par titre ou par code PRJ.','Ouvrez un projet pour voir les experts retenus et son avancement. Un brouillon reprend là où vous vous étiez arrêté.'],
    q:[['Comment réutiliser un ancien projet ?','Ouvrez-le et cliquez sur Dupliquer. Un nouveau brouillon est créé, que vous pouvez modifier librement.'],['Que signifie « En examen » ?','DZ-Bridge vérifie le projet et lance la mise en relation. Les experts correspondants arrivent en général sous 7 jours.']]},
  ar:{t:'المشاريع',i:'كل المشاريع التي صغتها أو قدّمتها، مع حالة كل منها.',
    s:['استخدم علامات التبويب للتنقل بين المسودات والمشاريع النشطة والمكتملة.','ابحث بالعنوان أو برمز PRJ.','افتح مشروعًا لترى الخبراء المطابَقين وتقدّم العمل. تُفتح المسودة من حيث توقفت.'],
    q:[['كيف أعيد استخدام مشروع سابق؟','افتحه وانقر على «نسخ». تُنشأ مسودة جديدة يمكنك تعديلها بحرية.'],['ماذا تعني «قيد المراجعة»؟','يتحقق DZ-Bridge من المشروع ويُجري المطابقة. يصل الخبراء المطابَقون عادةً خلال 7 أيام.']]}
},
'org.project':{
  en:{t:'Project details',i:'Follow one project from submission to completion.',
    s:['Matched experts are ranked by fit. Names are shown once an expert accepts.','Shortlist the experts you like, then invite them.','Progress shows where the project stands and what happens next.'],
    q:[['Can I invite several experts?','Yes. Shortlist and invite as many as you need; each one answers separately.'],['When do we see the expert’s contact details?','As soon as they accept. Click View contact to see them and open a conversation.']]},
  fr:{t:'Détails du projet',i:'Suivez un projet de la soumission jusqu’à la fin.',
    s:['Les experts retenus sont classés par pertinence. Les noms s’affichent une fois que l’expert accepte.','Présélectionnez les experts qui vous intéressent, puis invitez-les.','Avancement indique où en est le projet et la suite.'],
    q:[['Puis-je inviter plusieurs experts ?','Oui. Présélectionnez et invitez autant d’experts que nécessaire ; chacun répond séparément.'],['Quand voit-on les coordonnées de l’expert ?','Dès qu’il accepte. Cliquez sur Voir le contact pour les afficher et ouvrir une conversation.']]},
  ar:{t:'تفاصيل المشروع',i:'تابع مشروعًا واحدًا من تقديمه حتى اكتماله.',
    s:['يُرتَّب الخبراء المطابَقون حسب الملاءمة، وتظهر الأسماء بعد قبول الخبير.','أضف الخبراء الذين يناسبونك إلى القائمة المختصرة ثم ادعُهم.','يوضح قسم التقدّم أين وصل المشروع وما الخطوة التالية.'],
    q:[['هل يمكنني دعوة عدة خبراء؟','نعم. أضف وادعُ العدد الذي تحتاجه، ويردّ كل خبير على حدة.'],['متى نرى بيانات اتصال الخبير؟','فور قبوله. انقر على «عرض الاتصال» لرؤيتها وبدء محادثة.']]}
},
'org.new':{flow:true,
  en:{t:'New project',i:'Describe a need in about 10 minutes. Your draft is saved as you go.',
    s:[['Basic info','Give a clear title, pick the collaboration type and the main domain. Start from a template to pre-fill the usual settings.'],['Skills required','Add skills and mark at most 3 as Required. Each Required skill narrows the pool sharply; watch the Match preview.'],['Logistics','Choose format, wilaya and dates. Click one of the Suggested dates to pick the period when the most experts are available.'],['Review & submit','Fix any issue listed, confirm the details and submit. Matching starts right away.']],
    q:[['Can I stop and come back later?','Yes. Click Save draft, or just leave: the draft is saved and listed under Projects.'],['Who sees our contact details?','Matched experts see the project, but your contact details are shared only after an expert accepts.']]},
  fr:{t:'Nouveau projet',i:'Décrivez un besoin en 10 minutes environ. Votre brouillon est enregistré au fur et à mesure.',
    s:[['Informations de base','Donnez un titre clair, choisissez le type de collaboration et le domaine principal. Partez d’un modèle pour préremplir les réglages habituels.'],['Compétences requises','Ajoutez des compétences et marquez-en au plus 3 comme Obligatoires. Chacune réduit fortement le vivier ; suivez l’Aperçu des correspondances.'],['Logistique','Choisissez le format, la wilaya et les dates. Cliquez sur une des Dates suggérées pour choisir la période où le plus d’experts sont disponibles.'],['Vérifier et soumettre','Corrigez les points signalés, confirmez les informations et soumettez. La mise en relation démarre aussitôt.']],
    q:[['Puis-je m’arrêter et revenir plus tard ?','Oui. Cliquez sur Enregistrer, ou quittez simplement : le brouillon est conservé dans Projets.'],['Qui voit nos coordonnées ?','Les experts retenus voient le projet, mais vos coordonnées ne sont partagées qu’après l’acceptation d’un expert.']]},
  ar:{t:'مشروع جديد',i:'صِف حاجتك في نحو 10 دقائق. تُحفظ المسودة تلقائيًا أثناء العمل.',
    s:[['المعلومات الأساسية','اكتب عنوانًا واضحًا واختر نوع التعاون والمجال الرئيسي. ابدأ من نموذج لملء الإعدادات المعتادة مسبقًا.'],['المهارات المطلوبة','أضف المهارات واجعل 3 منها على الأكثر «إلزامية». كل مهارة إلزامية تقلّص عدد الخبراء كثيرًا، فراقب معاينة المطابقات.'],['الجوانب اللوجستية','اختر الصيغة والولاية والتواريخ. انقر على أحد «التواريخ المقترحة» لتختار الفترة التي يتوفّر فيها أكبر عدد من الخبراء.'],['المراجعة والتقديم','صحّح المشكلات المذكورة وأكّد المعلومات ثم قدّم المشروع. تبدأ المطابقة فورًا.']],
    q:[['هل يمكنني التوقف والعودة لاحقًا؟','نعم. انقر على «حفظ المسودة» أو غادر ببساطة: تُحفظ المسودة في قائمة المشاريع.'],['من يرى بيانات اتصالنا؟','يرى الخبراء المطابَقون المشروع، لكن بيانات اتصالكم لا تُشارك إلا بعد قبول خبير.']]}
},
'org.matches':{
  en:{t:'Matches',i:'Experts suggested for all your projects, in one place.',
    s:['Filter by project or by status to focus on what needs a decision.','Shortlist experts, then send an invitation with a short note.','Accepted experts show their contact details so you can start a conversation.'],
    q:[['Why is an expert “Awaiting reply”?','You invited them and they have 7 days to answer. Their answer appears here as soon as they reply.'],['What if an expert declines?','Their reason is shared anonymously. Invite another expert from the list.']]},
  fr:{t:'Correspondances',i:'Les experts proposés pour tous vos projets, au même endroit.',
    s:['Filtrez par projet ou par statut pour vous concentrer sur ce qui attend une décision.','Présélectionnez des experts, puis envoyez une invitation avec un court message.','Les experts qui ont accepté affichent leurs coordonnées pour démarrer une conversation.'],
    q:[['Pourquoi un expert est-il « En attente de réponse » ?','Vous l’avez invité et il dispose de 7 jours pour répondre. Sa réponse apparaît ici dès qu’il répond.'],['Et si un expert refuse ?','Sa raison est partagée de façon anonyme. Invitez un autre expert de la liste.']]},
  ar:{t:'المطابقات',i:'الخبراء المقترحون لكل مشاريعك في مكان واحد.',
    s:['صفِّ حسب المشروع أو الحالة لتركّز على ما ينتظر قرارًا.','أضف الخبراء إلى القائمة المختصرة ثم أرسل دعوة مع رسالة قصيرة.','يعرض الخبراء الذين قبلوا بيانات اتصالهم لتبدأ محادثة.'],
    q:[['لماذا يظهر خبير «بانتظار الرد»؟','لقد دعوته ولديه 7 أيام للرد. يظهر ردّه هنا فور إرساله.'],['ماذا لو رفض الخبير؟','يُشارك سبب الرفض دون ذكر الهوية. ادعُ خبيرًا آخر من القائمة.']]}
},
'org.messages':{
  en:{t:'Messages',i:'Talk with the experts working on your projects.',
    s:['Pick a conversation on the left; unread ones are marked.','Use messages to plan dates, travel and the programme of the visit.','Attach files such as a programme or a lab plan.'],
    q:[['Why can’t I message an expert yet?','A conversation opens once the expert accepts your invitation.'],['Are messages private?','Yes. Only your organization’s team and the expert can read them.']]},
  fr:{t:'Messages',i:'Échangez avec les experts qui travaillent sur vos projets.',
    s:['Choisissez une conversation à gauche ; les non lues sont signalées.','Servez-vous des messages pour fixer les dates, le voyage et le programme de la visite.','Joignez des fichiers, comme un programme ou un plan de laboratoire.'],
    q:[['Pourquoi ne puis-je pas encore écrire à un expert ?','Une conversation s’ouvre dès que l’expert accepte votre invitation.'],['Les messages sont-ils privés ?','Oui. Seuls l’équipe de votre organisation et l’expert peuvent les lire.']]},
  ar:{t:'الرسائل',i:'تواصل مع الخبراء العاملين على مشاريعك.',
    s:['اختر محادثة من القائمة؛ المحادثات غير المقروءة مميّزة.','استخدم الرسائل لتحديد التواريخ والسفر وبرنامج الزيارة.','أرفق ملفات مثل البرنامج أو مخطط المخبر.'],
    q:[['لماذا لا يمكنني مراسلة خبير بعد؟','تُفتح المحادثة بعد قبول الخبير دعوتك.'],['هل الرسائل خاصة؟','نعم. لا يقرؤها إلا فريق مؤسستك والخبير.']]}
},
'org.events':{
  en:{t:'Events',i:'Seminars, workshops and forums you host. Experts visiting your region can join.',
    s:['Click Promote an event to add a title, type, audience and dates.','Tick “Notify experts visiting my region” to reach experts who will be nearby on those dates.','Publish it as a public event to show it on the DZ-Bridge home page after a short review.'],
    q:[['How long does the review take?','DZ-Bridge checks every public event, usually within 24 hours.'],['Can I hide the expert’s name?','Yes. Untick the name option and the event says “with an expert from the DZ-Bridge network”.']]},
  fr:{t:'Événements',i:'Séminaires, ateliers et forums que vous organisez. Les experts en visite dans votre région peuvent y participer.',
    s:['Cliquez sur Promouvoir un événement pour saisir le titre, le type, le public et les dates.','Cochez « Prévenir les experts en visite dans ma région » pour toucher les experts présents à ces dates.','Publiez-le comme événement public pour l’afficher sur la page d’accueil de DZ-Bridge après une courte vérification.'],
    q:[['Combien de temps dure la vérification ?','DZ-Bridge vérifie chaque événement public, en général sous 24 heures.'],['Puis-je masquer le nom de l’expert ?','Oui. Décochez l’option du nom et l’événement indique « avec un expert du réseau DZ-Bridge ».']]},
  ar:{t:'الفعاليات',i:'الندوات والورشات والمنتديات التي تنظّمها. يمكن للخبراء الزائرين لمنطقتك المشاركة فيها.',
    s:['انقر على «روّج لفعالية» لإدخال العنوان والنوع والجمهور والتواريخ.','فعّل «أبلغ الخبراء الزائرين لمنطقتي في هذه التواريخ» للوصول إلى الخبراء القريبين في تلك الفترة.','انشرها كفعالية عامة لتظهر على الصفحة الرئيسية لـ DZ-Bridge بعد مراجعة قصيرة.'],
    q:[['كم تستغرق المراجعة؟','يراجع DZ-Bridge كل فعالية عامة، عادةً خلال 24 ساعة.'],['هل يمكنني إخفاء اسم الخبير؟','نعم. ألغِ خيار الاسم وستُعرض الفعالية «مع خبير من شبكة DZ-Bridge».']]}
},
'org.feedback':{
  en:{t:'Feedback',i:'Rate each expert after a collaboration.',
    s:['Experts to rate lists the collaborations that ended recently.','Click Rate, give stars and add a short comment.','Feedback you gave keeps a record of your past ratings.'],
    q:[['Do experts see my rating?','No. Ratings are private: they improve matching and are never shown to experts.'],['When should I rate an expert?','Right after the collaboration ends, while details are fresh. Pending ratings also appear on your dashboard.']]},
  fr:{t:'Avis',i:'Évaluez chaque expert après une collaboration.',
    s:['Experts à évaluer liste les collaborations terminées récemment.','Cliquez sur Évaluer, attribuez des étoiles et ajoutez un court commentaire.','Avis donnés garde la trace de vos évaluations passées.'],
    q:[['Les experts voient-ils ma note ?','Non. Les notes sont privées : elles améliorent la mise en relation et ne sont jamais montrées aux experts.'],['Quand évaluer un expert ?','Juste après la fin de la collaboration, quand les détails sont encore frais. Les avis en attente apparaissent aussi sur votre tableau de bord.']]},
  ar:{t:'التقييمات',i:'قيّم كل خبير بعد انتهاء التعاون.',
    s:['تعرض قائمة «خبراء بانتظار التقييم» التعاونات التي انتهت مؤخرًا.','انقر على «قيّم» وامنح النجوم وأضف تعليقًا قصيرًا.','تحتفظ قائمة «التقييمات التي قدّمتها» بسجل تقييماتك السابقة.'],
    q:[['هل يرى الخبراء تقييمي؟','لا. التقييمات خاصة: تحسّن المطابقة ولا تُعرض على الخبراء أبدًا.'],['متى أقيّم الخبير؟','مباشرة بعد انتهاء التعاون والتفاصيل ما تزال حاضرة. تظهر التقييمات المنتظرة أيضًا في لوحة التحكم.']]}
},
'org.profile':{
  en:{t:'Organization profile',i:'The details experts see about your organization, and your team.',
    s:['Keep your name, type and wilaya up to date: experts see them when you invite them.','Invite a member so colleagues can submit projects and talk with experts.','Click Edit the full profile to change your needs and default project settings.'],
    q:[['Why do our default settings matter?','New projects are pre-filled with them, which saves time on every submission.'],['Where do I change our domains and needs?','Click Edit the full profile. New projects are pre-filled from it.']]},
  fr:{t:'Profil de l’organisation',i:'Les informations que les experts voient sur votre organisation, et votre équipe.',
    s:['Tenez à jour votre nom, votre type et votre wilaya : les experts les voient quand vous les invitez.','Invitez un membre pour que vos collègues puissent soumettre des projets et échanger avec les experts.','Cliquez sur Modifier le profil complet pour changer vos besoins et les réglages par défaut des projets.'],
    q:[['À quoi servent les réglages par défaut ?','Chaque nouveau projet en est prérempli, ce qui fait gagner du temps à chaque soumission.'],['Où modifier nos domaines et nos besoins ?','Cliquez sur Modifier le profil complet. Les nouveaux projets en sont préremplis.']]},
  ar:{t:'ملف المؤسسة',i:'المعلومات التي يراها الخبراء عن مؤسستك، وفريقك.',
    s:['حدّث اسم المؤسسة ونوعها وولايتها: يراها الخبراء عند دعوتهم.','انقر على «دعوة عضو» ليتمكن زملاؤك من تقديم المشاريع والتواصل مع الخبراء.','انقر على «تعديل الملف الكامل» لتغيير احتياجاتك وإعدادات المشاريع الافتراضية.'],
    q:[['ما فائدة الإعدادات الافتراضية؟','تُملأ بها المشاريع الجديدة مسبقًا، فتوفّر الوقت في كل تقديم.'],['أين أعدّل مجالاتنا واحتياجاتنا؟','انقر على «تعديل الملف الكامل». تُملأ المشاريع الجديدة منه مسبقًا.']]}
},

/* ---------- expert dashboard ---------- */
'exp.dashboard':{
  en:{t:'Dashboard',i:'Your matches, messages and next steps in one place.',
    s:['Upcoming opportunities lists projects where organizations matched you, with their status.','Quick actions help you add availability, update your profile and complete surveys.','A complete profile and up-to-date availability bring you more matches.'],
    q:[['Why don’t I get any matches?','Add availability for the dates you can travel or work remotely, and check that your skills are up to date.'],['Do organizations see my name?','No. You appear as an anonymous expert number until you accept an invitation.']]},
  fr:{t:'Tableau de bord',i:'Vos correspondances, vos messages et vos prochaines étapes au même endroit.',
    s:['Opportunités à venir liste les projets pour lesquels des organisations vous ont retenu, avec leur statut.','Les actions rapides vous aident à ajouter des disponibilités, mettre à jour votre profil et répondre aux questionnaires.','Un profil complet et des disponibilités à jour vous apportent plus de correspondances.'],
    q:[['Pourquoi je ne reçois aucune correspondance ?','Ajoutez des disponibilités pour les dates où vous pouvez vous déplacer ou travailler à distance, et vérifiez que vos compétences sont à jour.'],['Les organisations voient-elles mon nom ?','Non. Vous apparaissez sous un numéro d’expert anonyme jusqu’à ce que vous acceptiez une invitation.']]},
  ar:{t:'لوحة التحكم',i:'مطابقاتك ورسائلك وخطواتك التالية في مكان واحد.',
    s:['تعرض «الفرص القادمة» المشاريع التي طابقتك فيها المؤسسات، مع حالة كل منها.','تساعدك الإجراءات السريعة على إضافة فترات التوفّر وتحديث ملفك وإكمال الاستبيانات.','الملف المكتمل وفترات التوفّر المحدّثة يجلبان لك مطابقات أكثر.'],
    q:[['لماذا لا تصلني أي مطابقة؟','أضف فترات توفّر للتواريخ التي يمكنك فيها السفر أو العمل عن بُعد، وتأكّد من تحديث مهاراتك.'],['هل ترى المؤسسات اسمي؟','لا. تظهر برقم خبير مجهول حتى تقبل دعوة.']]}
},
'exp.opportunities':{
  en:{t:'Opportunities',i:'Projects where organizations matched you. Respond within 7 days.',
    s:['Use the tabs to see new, accepted, declined or closed opportunities.','Filter by city or sort by best match to decide faster.','Open an opportunity to see what the organization needs and how you match.'],
    q:[['What happens if I don’t answer in 7 days?','The invitation expires and the organization may invite another expert.'],['Can I ask questions before deciding?','Yes. Open the opportunity and click Ask a question first. Your identity stays hidden.']]},
  fr:{t:'Opportunités',i:'Les projets pour lesquels des organisations vous ont retenu. Répondez sous 7 jours.',
    s:['Utilisez les onglets pour voir les opportunités nouvelles, acceptées, refusées ou closes.','Filtrez par ville ou triez par meilleure correspondance pour décider plus vite.','Ouvrez une opportunité pour voir le besoin de l’organisation et votre correspondance.'],
    q:[['Que se passe-t-il si je ne réponds pas sous 7 jours ?','L’invitation expire et l’organisation peut inviter un autre expert.'],['Puis-je poser des questions avant de décider ?','Oui. Ouvrez l’opportunité et cliquez sur Poser une question d’abord. Votre identité reste masquée.']]},
  ar:{t:'الفرص',i:'المشاريع التي طابقتك فيها المؤسسات. ردّ خلال 7 أيام.',
    s:['استخدم علامات التبويب لرؤية الفرص الجديدة والمقبولة والمرفوضة والمغلقة.','صفِّ حسب المدينة أو رتّب حسب أفضل مطابقة لتقرّر أسرع.','افتح فرصة لترى ما تحتاجه المؤسسة ومدى مطابقتك.'],
    q:[['ماذا يحدث إن لم أردّ خلال 7 أيام؟','تنتهي صلاحية الدعوة وقد تدعو المؤسسة خبيرًا آخر.'],['هل يمكنني طرح أسئلة قبل أن أقرّر؟','نعم. افتح الفرصة وانقر على «اطرح سؤالًا أولًا». تبقى هويتك مخفية.']]}
},
'exp.opportunity':{
  en:{t:'Opportunity details',i:'Everything you need to decide: the need, the logistics and your match score.',
    s:['Check what they need and which of your skills match.','Logistics shows location, dates, travel, lodging and fee.','Accept invitation, Decline, or Ask a question first.'],
    q:[['What is shared when I accept?','Your name, CV and contact details are shared with the organization. They then contact you to plan the visit.'],['Can I undo a decline?','Yes, right after declining. You can also ask to stay in their shortlist for future dates.']]},
  fr:{t:'Détails de l’opportunité',i:'Tout pour décider : le besoin, la logistique et votre score de correspondance.',
    s:['Vérifiez ce dont ils ont besoin et lesquelles de vos compétences correspondent.','Logistique indique le lieu, les dates, le voyage, l’hébergement et la rémunération.','Accepter l’invitation, Refuser, ou Poser une question d’abord.'],
    q:[['Qu’est-ce qui est partagé quand j’accepte ?','Votre nom, votre CV et vos coordonnées sont partagés avec l’organisation, qui vous contacte ensuite pour préparer la visite.'],['Puis-je annuler un refus ?','Oui, juste après avoir refusé. Vous pouvez aussi rester dans leur sélection pour de futures dates.']]},
  ar:{t:'تفاصيل الفرصة',i:'كل ما تحتاجه لتقرّر: الحاجة والجوانب اللوجستية ودرجة مطابقتك.',
    s:['تحقّق مما يحتاجونه وأيّ من مهاراتك يطابقه.','تعرض الجوانب اللوجستية المكان والتواريخ والسفر والإقامة والأجر.','اقبل الدعوة، أو ارفض، أو اطرح سؤالًا أولًا.'],
    q:[['ماذا يُشارك عند القبول؟','يُشارك اسمك وسيرتك الذاتية وبيانات اتصالك مع المؤسسة، ثم تتواصل معك لتخطيط الزيارة.'],['هل يمكنني التراجع عن الرفض؟','نعم، مباشرة بعد الرفض. ويمكنك أيضًا البقاء في قائمتهم المختصرة لتواريخ لاحقة.']]}
},
'exp.availability':{
  en:{t:'Availability',i:'Tell organizations when and where you can collaborate.',
    s:['Click Add availability, then pick one of the Suggested windows, or choose a wilaya (or Remote) and dates yourself. Suggestions come from upcoming projects that fit your skills.','Tick “Also match nearby wilayas” to be matched within 200 km.','The calendar shows your windows at a glance; overlapping windows are flagged.'],
    q:[['Who sees my availability?','Organizations see these windows when they plan projects. Your travel plans stay private.'],['What is a draft window?','A window you saved but did not publish yet. It is not used for matching until you save it for real.']]},
  fr:{t:'Disponibilités',i:'Indiquez aux organisations quand et où vous pouvez collaborer.',
    s:['Cliquez sur Ajouter une disponibilité, puis choisissez un des Créneaux suggérés, ou indiquez vous-même une wilaya (ou À distance) et des dates. Les suggestions viennent des projets à venir qui correspondent à vos compétences.','Cochez « Inclure les wilayas voisines » pour être proposé dans un rayon de 200 km.','Le calendrier montre vos créneaux d’un coup d’œil ; les chevauchements sont signalés.'],
    q:[['Qui voit mes disponibilités ?','Les organisations voient ces créneaux quand elles planifient des projets. Vos projets de voyage restent privés.'],['Qu’est-ce qu’un créneau en brouillon ?','Un créneau enregistré mais pas encore publié. Il n’est pas utilisé pour la mise en relation tant que vous ne l’enregistrez pas définitivement.']]},
  ar:{t:'التوفّر',i:'أخبر المؤسسات متى وأين يمكنك التعاون.',
    s:['انقر على «أضف فترة توفّر»، ثم اختر إحدى «الفترات المقترحة»، أو حدّد بنفسك ولاية (أو «عن بُعد») والتواريخ. تأتي الاقتراحات من المشاريع القادمة التي تناسب مهاراتك.','فعّل «طابق أيضًا الولايات المجاورة» لتُطابَق ضمن 200 كم.','يعرض التقويم فتراتك بنظرة سريعة، وتُميَّز الفترات المتداخلة.'],
    q:[['من يرى فترات توفّري؟','ترى المؤسسات هذه الفترات عند تخطيط مشاريعها. تبقى خطط سفرك خاصة.'],['ما الفترة المحفوظة كمسودة؟','فترة حفظتها دون نشرها بعد. لا تُستخدم في المطابقة حتى تحفظها نهائيًا.']]}
},
'exp.messages':{
  en:{t:'Messages',i:'Talk with organizations and other matched experts.',
    s:['Pick a conversation on the left; unread ones are marked.','Use messages to agree on dates, travel and the programme.','Attach files such as your CV or slides.'],
    q:[['Why can’t I message an organization yet?','A conversation opens once you accept its invitation, or when you ask a question about an opportunity.'],['Are messages private?','Yes. Only the people in the conversation can read them.']]},
  fr:{t:'Messages',i:'Échangez avec les organisations et les autres experts retenus.',
    s:['Choisissez une conversation à gauche ; les non lues sont signalées.','Servez-vous des messages pour convenir des dates, du voyage et du programme.','Joignez des fichiers comme votre CV ou vos diapositives.'],
    q:[['Pourquoi ne puis-je pas encore écrire à une organisation ?','Une conversation s’ouvre quand vous acceptez son invitation, ou quand vous posez une question sur une opportunité.'],['Les messages sont-ils privés ?','Oui. Seules les personnes de la conversation peuvent les lire.']]},
  ar:{t:'الرسائل',i:'تواصل مع المؤسسات ومع الخبراء المطابَقين الآخرين.',
    s:['اختر محادثة من القائمة؛ المحادثات غير المقروءة مميّزة.','استخدم الرسائل للاتفاق على التواريخ والسفر والبرنامج.','أرفق ملفات مثل سيرتك الذاتية أو عرضك التقديمي.'],
    q:[['لماذا لا يمكنني مراسلة مؤسسة بعد؟','تُفتح المحادثة عند قبولك دعوتها، أو عند طرحك سؤالًا حول فرصة.'],['هل الرسائل خاصة؟','نعم. لا يقرؤها إلا المشاركون في المحادثة.']]}
},
'exp.feedback':{
  en:{t:'Feedback',i:'Share private feedback after each collaboration.',
    s:['Pending surveys are listed first, with how many days are left.','Click Rate, give stars and add a short comment.','Your past feedback stays listed below.'],
    q:[['Does the organization see my feedback?','No. Feedback is private and only used to improve matching.'],['Why does feedback matter?','It helps DZ-Bridge suggest better projects to you and better experts to organizations.']]},
  fr:{t:'Avis',i:'Partagez un avis privé après chaque collaboration.',
    s:['Les questionnaires en attente apparaissent en premier, avec le nombre de jours restants.','Cliquez sur Évaluer, attribuez des étoiles et ajoutez un court commentaire.','Vos avis passés restent listés en dessous.'],
    q:[['L’organisation voit-elle mon avis ?','Non. Les avis sont privés et servent uniquement à améliorer la mise en relation.'],['À quoi servent les avis ?','Ils aident DZ-Bridge à vous proposer de meilleurs projets et de meilleurs experts aux organisations.']]},
  ar:{t:'التقييمات',i:'شارك تقييمًا خاصًا بعد كل تعاون.',
    s:['تظهر الاستبيانات المنتظرة أولًا مع عدد الأيام المتبقية.','انقر على «تقييم» وامنح النجوم وأضف تعليقًا قصيرًا.','تبقى تقييماتك السابقة معروضة في الأسفل.'],
    q:[['هل ترى المؤسسة تقييمي؟','لا. التقييمات خاصة ولا تُستخدم إلا لتحسين المطابقة.'],['ما أهمية التقييمات؟','تساعد DZ-Bridge على اقتراح مشاريع أفضل لك وخبراء أفضل للمؤسسات.']]}
},

/* ---------- profile set-up wizards ---------- */
'org-profile':{flow:true,
  en:{t:'Organization profile set-up',i:'Four short steps. Almost every answer is a dropdown, chip or card.',
    s:[['Who you are','Name, type and wilaya of your organization. Experts see them when you invite them.'],['What you need','Your usual domains and needs. We use them to suggest experts and pre-fill your projects.'],['You and your team','Your role, and colleagues you want to invite to submit projects.'],['Review and confirm','Check everything, then go live.']],
    q:[['Why is my organization not verified yet?','Our team checks new organizations within 2 working days. Adding your website and using your work email speeds it up.'],['Can I change these answers later?','Yes, any time from Profile in your dashboard.']]},
  fr:{t:'Création du profil de l’organisation',i:'Quatre étapes courtes. Presque chaque réponse est une liste, une puce ou une carte.',
    s:[['Qui vous êtes','Nom, type et wilaya de votre organisation. Les experts les voient quand vous les invitez.'],['Ce dont vous avez besoin','Vos domaines et besoins habituels. Nous les utilisons pour suggérer des experts et préremplir vos projets.'],['Vous et votre équipe','Votre rôle, et les collègues que vous voulez inviter à soumettre des projets.'],['Vérifier et confirmer','Vérifiez tout, puis mettez votre organisation en ligne.']],
    q:[['Pourquoi mon organisation n’est-elle pas encore vérifiée ?','Notre équipe vérifie les nouvelles organisations sous 2 jours ouvrés. Ajouter votre site web et utiliser votre e-mail professionnel accélère la vérification.'],['Puis-je modifier ces réponses plus tard ?','Oui, à tout moment depuis Profil dans votre tableau de bord.']]},
  ar:{t:'إعداد ملف المؤسسة',i:'أربع خطوات قصيرة. معظم الإجابات قوائم أو شارات أو بطاقات.',
    s:[['من أنتم','اسم مؤسستك ونوعها وولايتها. يراها الخبراء عند دعوتهم.'],['ما تحتاجونه','مجالاتكم واحتياجاتكم المعتادة. نستخدمها لاقتراح الخبراء وملء مشاريعكم مسبقًا.'],['أنت وفريقك','دورك، والزملاء الذين تريد دعوتهم لتقديم المشاريع.'],['المراجعة والتأكيد','تحقّق من كل شيء ثم انشر ملف مؤسستك.']],
    q:[['لماذا لم تُوثَّق مؤسستي بعد؟','يتحقق فريقنا من المؤسسات الجديدة خلال يومَي عمل. إضافة موقعك واستخدام بريدك المهني يسرّعان ذلك.'],['هل يمكنني تعديل هذه الإجابات لاحقًا؟','نعم، في أي وقت من قسم الملف في لوحة التحكم.']]}
},
'expert-profile':{flow:true,
  en:{t:'Expert profile set-up',i:'Start from your CV or a public profile; you check every field before anything is published.',
    s:[['Import','Add your CV, LinkedIn or Google Scholar profile, and we draft your profile for you.'],['Personal info','Only your city and status are visible to organizations before you accept an invitation.'],['Expertise','Organizations’ required skills are matched against what you add here, so be specific.'],['Review','See what DZ-Bridge uses for matching and the anonymous version organizations see.']],
    q:[['Can I skip the import?','Yes. You can fill in every field by hand instead.'],['Is my CV shared with organizations?','Only after you accept an invitation. Until then you stay anonymous.']]},
  fr:{t:'Création du profil d’expert',i:'Partez de votre CV ou d’un profil public ; vous vérifiez chaque champ avant toute publication.',
    s:[['Import','Ajoutez votre CV, votre profil LinkedIn ou Google Scholar, et nous préparons votre profil.'],['Informations personnelles','Seuls votre ville et votre statut sont visibles des organisations avant que vous acceptiez une invitation.'],['Expertise','Les compétences recherchées par les organisations sont comparées à ce que vous ajoutez ici : soyez précis.'],['Vérification','Voyez ce que DZ-Bridge utilise pour la mise en relation et la version anonyme que voient les organisations.']],
    q:[['Puis-je passer l’import ?','Oui. Vous pouvez remplir chaque champ à la main.'],['Mon CV est-il partagé avec les organisations ?','Seulement après que vous acceptez une invitation. D’ici là, vous restez anonyme.']]},
  ar:{t:'إعداد ملف الخبير',i:'ابدأ من سيرتك الذاتية أو ملف عام؛ تراجع كل حقل قبل نشر أي شيء.',
    s:[['الاستيراد','أضف سيرتك الذاتية أو ملفك على LinkedIn أو Google Scholar، وسنُعدّ لك مسودة ملفك.'],['المعلومات الشخصية','لا تظهر للمؤسسات سوى مدينتك ووضعك قبل قبولك دعوة.'],['الخبرة','تُطابق المهارات التي تطلبها المؤسسات مع ما تضيفه هنا، فكن دقيقًا.'],['المراجعة','اطّلع على ما يستخدمه DZ-Bridge للمطابقة وعلى النسخة المجهولة التي تراها المؤسسات.']],
    q:[['هل يمكنني تخطي الاستيراد؟','نعم. يمكنك ملء كل الحقول يدويًا.'],['هل تُشارك سيرتي الذاتية مع المؤسسات؟','فقط بعد قبولك دعوة. حتى ذلك الحين تبقى مجهول الهوية.']]}
},

/* ---------- account ---------- */
'login':{flow:true,
  en:{t:'Log in',i:'Log in with the email and password you used to sign up.',
    s:[['Log in','Enter your email and password. After several failed attempts the form locks for a few minutes; you can ask for a log-in link by email instead.'],['Forgot your password?','Ask for a reset link, open it from your inbox and choose a new password.']],
    q:[['I have both an expert and an organization profile.','Log in once, then switch between your profiles from the menu at the top right.'],['The reset email did not arrive.','Check your spam folder and wait a few minutes before asking again.']]},
  fr:{t:'Se connecter',i:'Connectez-vous avec l’e-mail et le mot de passe utilisés à l’inscription.',
    s:[['Se connecter','Saisissez votre e-mail et votre mot de passe. Après plusieurs échecs, le formulaire se bloque quelques minutes ; vous pouvez demander un lien de connexion par e-mail.'],['Mot de passe oublié ?','Demandez un lien de réinitialisation, ouvrez-le depuis votre boîte de réception et choisissez un nouveau mot de passe.']],
    q:[['J’ai un profil expert et un profil organisation.','Connectez-vous une fois, puis passez d’un profil à l’autre depuis le menu en haut.'],['L’e-mail de réinitialisation n’est pas arrivé.','Vérifiez vos courriers indésirables et attendez quelques minutes avant de redemander.']]},
  ar:{t:'تسجيل الدخول',i:'سجّل الدخول بالبريد الإلكتروني وكلمة المرور اللذين استخدمتهما عند التسجيل.',
    s:[['تسجيل الدخول','أدخل بريدك الإلكتروني وكلمة المرور. بعد عدة محاولات فاشلة يُقفل النموذج بضع دقائق، ويمكنك طلب رابط دخول عبر البريد بدلًا من ذلك.'],['نسيت كلمة المرور؟','اطلب رابط إعادة التعيين، وافتحه من بريدك واختر كلمة مرور جديدة.']],
    q:[['لدي ملف خبير وملف مؤسسة.','سجّل الدخول مرة واحدة، ثم بدّل بين ملفاتك من القائمة في الأعلى.'],['لم تصلني رسالة إعادة التعيين.','تحقّق من مجلد الرسائل غير المرغوب فيها وانتظر بضع دقائق قبل الطلب مجددًا.']]}
},
'signup':{flow:true,
  en:{t:'Sign up',i:'Create your account in two short steps.',
    s:[['Create your account','Choose whether you join as an expert or an organization, then enter your email and a password.'],['Verify your email','Open the link we send you to activate your account.'],['Set up your profile','Once verified, you go straight to your profile set-up.']],
    q:[['Expert or organization: which one?','Experts share their knowledge. Organizations (universities, companies, public bodies) post projects. You can add the other profile later.'],['The verification email did not arrive.','Check your spam folder, then ask for a new link from the same page.']]},
  fr:{t:'Inscription',i:'Créez votre compte en deux étapes courtes.',
    s:[['Créer votre compte','Indiquez si vous rejoignez la plateforme comme expert ou comme organisation, puis saisissez votre e-mail et un mot de passe.'],['Vérifier votre e-mail','Ouvrez le lien que nous vous envoyons pour activer votre compte.'],['Créer votre profil','Une fois vérifié, vous passez directement à la création de votre profil.']],
    q:[['Expert ou organisation : que choisir ?','Les experts partagent leur savoir. Les organisations (universités, entreprises, organismes publics) publient des projets. Vous pourrez ajouter l’autre profil plus tard.'],['L’e-mail de vérification n’est pas arrivé.','Vérifiez vos courriers indésirables, puis demandez un nouveau lien depuis la même page.']]},
  ar:{t:'إنشاء حساب',i:'أنشئ حسابك في خطوتين قصيرتين.',
    s:[['أنشئ حسابك','اختر الانضمام كخبير أو كمؤسسة، ثم أدخل بريدك الإلكتروني وكلمة مرور.'],['تحقّق من بريدك الإلكتروني','افتح الرابط الذي نرسله إليك لتفعيل حسابك.'],['أعدّ ملفك','بعد التحقق تنتقل مباشرة إلى إعداد ملفك.']],
    q:[['خبير أم مؤسسة: ماذا أختار؟','يشارك الخبراء معارفهم، وتنشر المؤسسات (الجامعات والشركات والهيئات العمومية) المشاريع. يمكنك إضافة الملف الآخر لاحقًا.'],['لم تصلني رسالة التحقق.','تحقّق من مجلد الرسائل غير المرغوب فيها، ثم اطلب رابطًا جديدًا من الصفحة نفسها.']]}
},

/* ---------- public pages ---------- */
'home':{
  en:{t:'Welcome to DZ-Bridge',i:'DZ-Bridge connects Algerian institutions with experts in Algeria and in the diaspora.',
    s:['How it works shows the two sides: switch between the institution and expert views.','Your name stays hidden until you accept an invitation.','Events lists public talks and workshops hosted with experts from the network.'],
    q:[['Who can join?','Experts based in Algeria or abroad, and Algerian organizations such as universities, companies and public bodies.'],['How do I join?','Click Get started, choose expert or organization, and follow the steps.']]},
  fr:{t:'Bienvenue sur DZ-Bridge',i:'DZ-Bridge met en relation les institutions algériennes avec des experts en Algérie et dans la diaspora.',
    s:['Comment ça marche présente les deux côtés : passez de la vue institution à la vue expert.','Votre nom reste masqué jusqu’à ce que vous acceptiez une invitation.','Événements liste les conférences et ateliers publics organisés avec des experts du réseau.'],
    q:[['Qui peut s’inscrire ?','Les experts en Algérie ou à l’étranger, et les organisations algériennes : universités, entreprises, organismes publics.'],['Comment s’inscrire ?','Cliquez sur Commencer, choisissez expert ou organisation, et suivez les étapes.']]},
  ar:{t:'مرحبًا بك في DZ-Bridge',i:'يربط DZ-Bridge المؤسسات الجزائرية بخبراء في الجزائر وفي المهجر.',
    s:['يعرض قسم «كيف يعمل» الجانبين: بدّل بين عرض المؤسسة وعرض الخبير.','يبقى اسمك مخفيًا حتى تقبل دعوة.','يعرض قسم الفعاليات المحاضرات والورشات العامة المنظّمة مع خبراء الشبكة.'],
    q:[['من يمكنه الانضمام؟','الخبراء المقيمون في الجزائر أو في الخارج، والمؤسسات الجزائرية مثل الجامعات والشركات والهيئات العمومية.'],['كيف أنضم؟','انقر على «ابدأ الآن»، واختر خبيرًا أو مؤسسة، ثم اتبع الخطوات.']]}
},
'experts':{
  en:{t:'For experts',i:'How you can share your expertise with Algerian institutions.',
    s:['Three ways to contribute: pick the roles that suit you, from a single lecture to longer collaborations.','Add the dates you will be in Algeria, or work remotely.','Organizations see an anonymous profile until you accept.'],
    q:[['Do I need to live in Algeria?','No. Experts based abroad add the dates they will be in Algeria, or work remotely.'],['How much time does it take?','You choose. Accept only the opportunities that fit your dates.']]},
  fr:{t:'Pour les experts',i:'Comment partager votre expertise avec les institutions algériennes.',
    s:['Trois façons de contribuer : choisissez les rôles qui vous conviennent, d’une conférence à une collaboration plus longue.','Ajoutez les dates où vous serez en Algérie, ou travaillez à distance.','Les organisations voient un profil anonyme jusqu’à ce que vous acceptiez.'],
    q:[['Dois-je vivre en Algérie ?','Non. Les experts à l’étranger ajoutent les dates où ils seront en Algérie, ou travaillent à distance.'],['Combien de temps cela prend-il ?','C’est vous qui choisissez. N’acceptez que les opportunités qui correspondent à vos dates.']]},
  ar:{t:'للخبراء',i:'كيف تشارك خبرتك مع المؤسسات الجزائرية.',
    s:['ثلاث طرق للمساهمة: اختر الأدوار التي تناسبك، من محاضرة واحدة إلى تعاون أطول.','أضف التواريخ التي ستكون فيها في الجزائر، أو اعمل عن بُعد.','ترى المؤسسات ملفًا مجهول الهوية حتى تقبل.'],
    q:[['هل يجب أن أقيم في الجزائر؟','لا. يضيف الخبراء المقيمون في الخارج التواريخ التي سيكونون فيها في الجزائر، أو يعملون عن بُعد.'],['كم من الوقت يتطلب ذلك؟','أنت من يقرّر. اقبل فقط الفرص التي تناسب تواريخك.']]}
},
'events':{
  en:{t:'Events',i:'Talks, workshops and forums that Algerian organizations host with experts from the DZ-Bridge network.',
    s:['Search by title, organization or city.','Use Filter to narrow by type (workshop, seminar…) or format (on site, online).','Every event is checked by DZ-Bridge before it appears here.'],
    q:[['Who hosts these events?','Algerian organizations, with experts from the DZ-Bridge network. Some events name the expert, others say “With an expert from the DZ-Bridge network”.'],['How can my organization publish an event?','From your organization dashboard: Events, then Promote an event, and tick “Publish as a public event”.']]},
  fr:{t:'Événements',i:'Conférences, ateliers et forums organisés par des institutions algériennes avec des experts du réseau DZ-Bridge.',
    s:['Recherchez par titre, organisation ou ville.','Utilisez Filtrer pour affiner par type (atelier, séminaire…) ou par format (sur place, en ligne).','Chaque événement est vérifié par DZ-Bridge avant d’apparaître ici.'],
    q:[['Qui organise ces événements ?','Des institutions algériennes, avec des experts du réseau DZ-Bridge. Certains événements nomment l’expert, d’autres indiquent « Avec un expert du réseau DZ-Bridge ».'],['Comment mon organisation peut-elle publier un événement ?','Depuis votre tableau de bord organisation : Événements, puis Promouvoir un événement, et cochez « Publier comme événement public ».']]},
  ar:{t:'الفعاليات',i:'محاضرات وورشات ومنتديات تنظّمها مؤسسات جزائرية مع خبراء من شبكة DZ-Bridge.',
    s:['ابحث بالعنوان أو المؤسسة أو المدينة.','استخدم «تصفية» لتحديد النوع (ورشة، ندوة…) أو الصيغة (حضوري، عن بُعد).','يراجع DZ-Bridge كل فعالية قبل ظهورها هنا.'],
    q:[['من ينظّم هذه الفعاليات؟','مؤسسات جزائرية مع خبراء من شبكة DZ-Bridge. بعض الفعاليات تذكر اسم الخبير، وأخرى تكتفي بعبارة «مع خبير من شبكة DZ-Bridge».'],['كيف تنشر مؤسستي فعالية؟','من لوحة تحكم المؤسسة: الفعاليات، ثم «روّج لفعالية»، وفعّل «انشر كفعالية عامة».']]}
}
};
HELP['landing']=HELP.home;

/* ---------- where are we? ---------- */
function $(s,r){return (r||document).querySelector(s);}
function route(){return (location.hash||'').slice(1).split('/')[0];}
function visibleAttr(sel,attr){
  var els=document.querySelectorAll(sel);
  for(var i=0;i<els.length;i++)if(!els[i].hidden&&!els[i].closest('[hidden]'))return els[i].getAttribute(attr);
  return null;
}
var PAGE=(location.pathname.split('/').pop()||'').replace(/\.html?$/i,'').toLowerCase();
var CTX={
  'org-dashboard':function(){
    var r=route()||'dashboard';if(!HELP['org.'+r])r='dashboard';
    var cur=null;
    if(r==='new'){var h=$('#view .stepcard h2');cur=h?(parseInt(h.textContent,10)||1)-1:$('#view section.rv')?3:null;}
    return {key:'org.'+r,cur:cur};
  },
  'expert-dashboard':function(){var r=route()||'dashboard';if(!HELP['exp.'+r])r='dashboard';return {key:'exp.'+r};},
  'org-profile':function(){var s=visibleAttr('.panel[data-step]','data-step');return {key:'org-profile',cur:/^[1-4]$/.test(s)?s-1:null};},
  'expert-profile':function(){var s=visibleAttr('.panel[data-step]','data-step');return {key:'expert-profile',cur:s==='parse'?0:/^[1-4]$/.test(s)?s-1:null};},
  'login':function(){var v=visibleAttr('[data-view]','data-view');return {key:'login',cur:v==='login'?0:v?1:null};},
  'signup':function(){var v=visibleAttr('[data-view]','data-view');return {key:'signup',cur:{form:0,verify:1,verified:2}[v]};},
  'homepage':function(){return {key:'home'};},
  'landing_page':function(){return {key:'landing'};},
  'expert':function(){return {key:'experts'};},
  'events':function(){return {key:'events'};}
};
if(!CTX[PAGE])return;

/* ---------- styles (page tokens, so light/dark and RTL follow the page) ---------- */
var css=
'.hlp-btn{display:grid;place-items:center;flex:none;width:40px;height:40px;border:0;border-radius:999px;background:transparent;color:var(--text-primary);cursor:pointer;transition:background-color .15s}'+
'.hlp-btn:hover,.hlp-btn[aria-expanded="true"]{background:var(--bg-subtle)}'+
'dialog.hlp{position:fixed;inset:0;inset-inline-start:auto;margin:0;width:min(420px,100vw);max-width:100vw;height:100%;max-height:100%;padding:0;border:0;border-inline-start:1px solid var(--border);background:var(--bg-surface);color:var(--text-primary);box-shadow:0 0 60px -20px rgba(40,1,31,.45);font:400 15px/22px var(--sans)}'+
':root[lang="ar"] dialog.hlp{font:400 15px/26px var(--arabic)}'+
'dialog.hlp[open]{display:flex;flex-direction:column;animation:hlpIn .22s ease-out}'+
':root[dir="rtl"] dialog.hlp[open]{animation-name:hlpInR}'+
'@keyframes hlpIn{from{transform:translateX(24px);opacity:0}}@keyframes hlpInR{from{transform:translateX(-24px);opacity:0}}'+
'@media (prefers-reduced-motion:reduce){dialog.hlp[open]{animation:none}}'+
'dialog.hlp::backdrop{background:rgba(19,5,16,.45)}'+
'.hlp-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 16px;border-bottom:1px solid var(--border)}'+
'.hlp-k{margin:0 0 2px;font:500 11px/14px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--text-accent)}'+
':root[lang="ar"] .hlp-k{font-family:var(--arabic);font-size:12px;letter-spacing:0}'+
'.hlp-h h2{margin:0;font:600 19px/26px var(--sans);outline:none}'+
':root[lang="ar"] .hlp-h h2{font-family:var(--arabic)}'+
'.hlp-x{display:grid;place-items:center;flex:none;width:36px;height:36px;margin:-4px -6px 0 0;border:0;border-radius:999px;background:transparent;color:var(--text-secondary);cursor:pointer}'+
':root[dir="rtl"] .hlp-x{margin:-4px 0 0 -6px}'+
'.hlp-x:hover{background:var(--bg-subtle);color:var(--text-primary)}'+
'.hlp-b{flex:1;overflow-y:auto;padding:18px 20px 22px;overscroll-behavior:contain}'+
'.hlp-i{margin:0 0 20px;color:var(--text-secondary)}'+
'.hlp-b h3{margin:0 0 10px;font:500 11.5px/16px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted)}'+
':root[lang="ar"] .hlp-b h3{font-family:var(--arabic);font-size:13px;letter-spacing:0}'+
'.hlp-s{display:grid;gap:8px;margin:0 0 24px;padding:0;list-style:none}'+
'.hlp-s li{display:flex;gap:12px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;font-size:14px;line-height:20px}'+
':root[lang="ar"] .hlp-s li{line-height:24px}'+
'.hlp-s .n{display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:50%;background:var(--bg-subtle);font:600 12px/1 var(--mono);color:var(--text-secondary)}'+
'.hlp-s b{display:block;font-weight:600}'+
'.hlp-s span.tx{color:var(--text-secondary)}'+
'.hlp-s li.cur{border-color:var(--brand);background:var(--accent-lavender-subtle)}'+
'.hlp-s li.cur .n{background:var(--brand);color:var(--text-on-brand)}'+
'.hlp-here{display:inline-block;margin-inline-start:6px;padding:1px 8px;border-radius:999px;background:var(--brand);color:var(--text-on-brand);font:600 11px/18px var(--sans);vertical-align:1px}'+
':root[lang="ar"] .hlp-here{font-family:var(--arabic)}'+
'.hlp-q{margin:0 0 24px;border-top:1px solid var(--border)}'+
'.hlp-q details{border-bottom:1px solid var(--border)}'+
'.hlp-q summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 2px;font-weight:600;font-size:14px;line-height:20px;cursor:pointer;list-style:none}'+
'.hlp-q summary::-webkit-details-marker{display:none}'+
'.hlp-q summary svg{flex:none;color:var(--text-muted);transition:transform .15s}'+
'.hlp-q details[open] summary svg{transform:rotate(180deg)}'+
'.hlp-q p{margin:0 0 14px;padding:0 2px;font-size:14px;line-height:21px;color:var(--text-secondary)}'+
'.hlp-c{padding:16px;border-radius:14px;background:var(--bg-subtle)}'+
'.hlp-c b{display:block;font-weight:600}'+
'.hlp-c p{margin:4px 0 12px;font-size:14px;line-height:20px;color:var(--text-secondary)}'+
'.hlp-c a{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px;border-radius:999px;background:var(--brand);color:var(--text-on-brand);font-weight:600;font-size:14px;text-decoration:none}'+
'.hlp-c a:hover{filter:brightness(1.08)}'+
'.hlp-f{margin:0;padding:12px 20px;border-top:1px solid var(--border);font-size:12.5px;line-height:18px;color:var(--text-muted)}'+
'.hlp-f kbd{display:inline-block;min-width:18px;padding:0 5px;border:1px solid var(--border-strong);border-bottom-width:2px;border-radius:5px;font:500 11px/16px var(--mono);text-align:center;color:var(--text-secondary)}'+
'dialog.hlp :focus-visible:not(h2){outline:3px solid color-mix(in srgb,var(--border-focus,var(--accent-gold)) 65%,transparent);outline-offset:2px}'+
'@media (max-width:480px){.hlp-f{display:none}}'+
// public pages: on phones the header is full, so help moves into the ☰ menu
'#nav .hlp-nav{display:none}'+
'@media (max-width:560px){.hlp-btn.hlp-m{display:none}#nav .hlp-nav{display:flex}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- button + panel ---------- */
var ICON_Q='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8"/></g><circle cx="12" cy="17" r="1.1" fill="currentColor"/></svg>';
var ICON_X='<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
var ICON_V='<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICON_M='<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M3 5.5l7 5.5 7-5.5"/></g></svg>';

function L(){var l=document.documentElement.lang;return UI[l]?l:'en';}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

var tb=document.getElementById('themeBtn');
var btn=document.createElement('button');
btn.type='button';btn.className='hlp-btn';btn.id='helpBtn';btn.innerHTML=ICON_Q;
btn.setAttribute('aria-haspopup','dialog');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','hlpDlg');
if(tb){btn.style.width=btn.style.height=getComputedStyle(tb).width;tb.parentNode.insertBefore(btn,tb);}
var navLink=null,nav=document.getElementById('nav');
if(nav&&document.getElementById('menuBtn')){
  btn.classList.add('hlp-m');
  navLink=document.createElement('a');navLink.href='#';navLink.className='hlp-nav';navLink.setAttribute('data-help','');
  nav.appendChild(navLink);
}

var dlg=document.createElement('dialog');
dlg.className='hlp';dlg.id='hlpDlg';dlg.setAttribute('aria-labelledby','hlpH');
document.body.appendChild(dlg);
var returnTo=null;

function labels(){var u=UI[L()];btn.setAttribute('aria-label',u.btn);btn.title=u.btn;if(navLink)navLink.textContent=u.btn;}

function build(){
  var u=UI[L()],c=CTX[PAGE](),e=HELP[c.key],h=e[L()]||e.en,flow=!!e.flow,cur=flow&&c.cur!=null?c.cur:-1;
  var steps=h.s.map(function(x,i){
    var isArr=Array.isArray(x),here=i===cur?'<span class="hlp-here">'+esc(u.here)+'</span>':'';
    var body=isArr?'<div><b>'+esc(x[0])+here+'</b><span class="tx">'+esc(x[1])+'</span></div>':'<div><span class="tx">'+esc(x)+'</span></div>';
    return '<li'+(i===cur?' class="cur" aria-current="step"':'')+'><span class="n" aria-hidden="true">'+(i+1)+'</span>'+body+'</li>';
  }).join('');
  var faq=h.q.map(function(x){return '<details><summary>'+esc(x[0])+ICON_V+'</summary><p>'+esc(x[1])+'</p></details>';}).join('');
  var mail='mailto:'+SUPPORT+'?subject='+encodeURIComponent('DZ-Bridge · '+u.subj+' · '+h.t);
  var key=esc(u.key).replace('?','<kbd>?</kbd>');
  dlg.innerHTML=
    '<div class="hlp-h"><div><p class="hlp-k">'+esc(u.kick)+'</p><h2 id="hlpH" tabindex="-1">'+esc(h.t)+'</h2></div>'+
    '<button class="hlp-x" type="button" data-hlp-close aria-label="'+esc(u.close)+'">'+ICON_X+'</button></div>'+
    '<div class="hlp-b"><p class="hlp-i">'+esc(h.i)+'</p>'+
    '<h3>'+esc(flow?u.flow:u.how)+'</h3><ol class="hlp-s">'+steps+'</ol>'+
    '<h3>'+esc(u.faq)+'</h3><div class="hlp-q">'+faq+'</div>'+
    '<div class="hlp-c"><b>'+esc(u.stuck)+'</b><p>'+esc(u.stuckS)+'</p><a href="'+esc(mail)+'">'+ICON_M+esc(u.mail)+'</a></div></div>'+
    '<p class="hlp-f">'+key+'</p>';
}

function open(){
  if(dlg.open)return;
  returnTo=document.activeElement;
  build();
  dlg.showModal();
  btn.setAttribute('aria-expanded','true');
  $('#hlpH',dlg).focus();
}
function close(){if(dlg.open)dlg.close();}
dlg.addEventListener('close',function(){
  btn.setAttribute('aria-expanded','false');
  if(returnTo&&document.contains(returnTo))returnTo.focus();
});
// a click on the backdrop lands on the <dialog> itself
dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('[data-hlp-close]'))close();});

btn.addEventListener('click',open);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-help]');if(a){e.preventDefault();open();}});
document.addEventListener('keydown',function(e){
  if(e.key!=='?'||e.ctrlKey||e.metaKey||e.altKey)return;
  var t=e.target,tag=t&&t.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
  if(document.querySelector('dialog[open]'))return;
  e.preventDefault();open();
});

// follow the page's language switch (it sets <html lang>)
new MutationObserver(function(){labels();if(dlg.open){build();$('#hlpH',dlg).focus();}})
  .observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
labels();
})();
