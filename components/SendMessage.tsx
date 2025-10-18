import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Center, Group, WhatsAppGroup } from '../types';
import { ArrowLeftIcon, PlusIcon, SendIcon, TrashIcon, FileTextIcon, UsersIcon, UserIcon, BookIcon, PencilIcon, WhatsAppIcon } from './Icons';

interface SendMessageProps {
  onBack: () => void;
  students: Student[];
  centers: Center[];
}

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
    { id: 'absence-1', title: 'غياب عن حصة اليوم', content: '*مكتب مستر // هاني العطار*\nتقرير حصه اليوم\n*بتاريخ:* [التاريخ]\n\nنبلغ حضرتك إن الطالب/ـة\n[اسم الطالب]\nلم يحضر حصه الإنجليزي اليوم 😔\nنرجو من ولى الامر متابعة الأمر لعدم تكرر الغياب لان ده ممكن يأثر على مستواه.\nلو في أي ظرف بتمنعه من الحضور، يرجى إعلامنا مسبقًا لتحديد معاد اخر لتعويض الحصه.\nونأمل الالتزام في الأيام القادمة 🙏\nهام: (لازم يعوض الحصة)\n*نرجو الرد من ولى الأمر للتأكد من استلام الرساله*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'no-homework-2', title: 'عدم حل الواجبات', content: '*مكتب مستر // هاني العطار*\nتقرير حصه اليوم\n*بتاريخ:* [التاريخ]\n\nنبلغ حضرتك إن الطالب/ـة\n[اسم الطالب]\nلم يعمل واجب الإنجليزي اليوم 😔\nنرجو من ولى الامر متابعة الأمر لعدم تكراره لان ده بيأثر على مستواه.\nالتحدث معه عن أهمية الواجب كجزء أساسي من المذاكرة، وتحسين مستواه 💼🧠\nنرجو من حضرتكم متابعته وتشجيعه لإنهاء الواجبات المطلوبة ✍️\nكل الدعم والتقدير 💬💪\n*نرجو الرد من ولى الأمر للتأكد من استلام الرساله*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'exam-grade-3', title: 'درجة امتحان شامل', content: '*مكتب مستر // هاني العطار*\nتقرير بدرجة الامتحان الشامل للوحدة:\n*بتاريخ:* [التاريخ]\n\nللطالب/ [اسم الطالب]\n\nدرجة الامتحان الشامل: [الدرجة] من [الدرجة النهائية]\n*نرجو الرد من ولى الأمر للتأكد من استلام الرساله*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'review-session-4', title: 'اعلان حصه المراجعة', content: '*مكتب ا. هانى العطار*\nحصة غدا\n*بتاريخ:* [التاريخ]\n\nالساعه : [الوقت] سنتر : [السنتر]\n\nمراجعه هامه على : (جرامر المنهج كله في ورقة)\n*نرجو الرد من ولى الأمر للتأكد من استلام الرساله*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'final-review-5', title: 'مراجعة ليلة الامتحان', content: '*مكتب مستر // هاني العطار*\nمراجعه ليله الامتحان انجليزي\n*بتاريخ:* [التاريخ]\n\nالساعه : [الوقت] سنتر : [السنتر]\n\n*نرجو الرد من ولى الأمر للتأكد من استلام الرساله*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'low-level-6', title: 'ضعف المستوى', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* ضعف المستوى\n\nلاحظنا انخفاض في مستوى الطالب خلال الفترة الأخيرة.\nنقترح مراجعة الدروس السابقة معه قبل الحضور للحصة والتأكد من حفظ ومراجعة الكلمات بشكل مستمر.\nالتشجيع والتحفيز (لو مستواك اتحسن هجبلك ....)\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'focus-issue-7', title: 'مشاكل في التركيز', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*المستوى:* غير مستقر\n*الملاحظة:* مشاكل في التركيز\n\nلوحظ أن الطالب يواجه صعوبة في التركيز داخل الحصة.\nنقترح تقليل استخدام الأجهزة الإلكترونية قبل النوم وتنظيم ساعات نومه.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'phone-usage-8', title: 'استخدام الهاتف بشكل مفرط', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*المستوى:* متذبذب\n*الملاحظة:* استخدام الهاتف بشكل مفرط\n\nلاحظنا أن استخدام الهاتف المحمول بشكل زائد يؤثر على تحصيل الطالب.\nنقترح وضع جدول زمني لاستخدام الهاتف ومراقبة المحتوى.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'bad-behavior-9', title: 'سلوك غير منضبط', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*المستوى:* جيد\n*الملاحظة:* سلوك غير منضبط\n\nتكررت بعض التصرفات غير المناسبة داخل الحصة مثل الكلام او.... .\nنرجو التحدث مع الطالب حول أهمية احترام المعلم والزملاء والحصة.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'improvement-10', title: 'تحسن ملحوظ', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*المستوى:* جيد جدًا\n*الملاحظة:* تحسن ملحوظ\n\nنود تهنئتكم على التحسن الواضح في مستوى الطالب مؤخرًا.\nنرجو الاستمرار في دعمه وتحفيزه بهذه الطريقة الممتازة.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'commitment-11', title: 'التزام كبير', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*المستوى:* ممتاز\n*الملاحظة:* التزام كبير\n\nنود الإشادة بالتزام الطالب بالحضور والواجبات والتفاعل الإيجابي.\nشكرًا لتعاونكم، ونشجعكم على الاستمرار بهذا النهج.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'participation-12', title: 'المشاركة الفعالة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* المشاركة الفعالة\n\nلاحظنا مشاركة مميزة من الطالب خلال الحصص وتحسن المستوى.\nنتمنى له مزيدًا من التميز والنجاح، واستمرار المتابعة والتشجيع من حضراتكم في المنزل.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'no-tools-13', title: 'عدم إحضار أدوات الدراسة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* عدم إحضار أدوات الدراسة\n\nلوحظ تكرار نسيان الطالب لأدواته الدراسية (قلم /ملزمة/ كراسة التسميع).\nنقترح: التأكد من تجهيز أدوات الدرس يوميًا قبل الحضور.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'talking-14', title: 'الحديث أثناء الشرح', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* الحديث أثناء الشرح\n\nيلاحظ تكرار حديث الطالب مع زملائه أثناء شرح الدرس.\nنرجو التحدث معه حول أهمية التركيز في الحصة وأن هذا يؤثر بشكل كبير على المستوى.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'no-homework-15', title: 'تكرار عدم حل الواجب', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* عدم حل الواجب\n\nيلاحظ تكرار عدم التزام الطالب بحل الواجبات المطلوبة.\nنرجو التحدث معه عن أهمية أداء الواجبات كجزء أساسي من المذاكرة والتدريب على الدروس.\n*نصائح:*\n• خصصوا وقتًا ثابتًا لحل الواجب يوميًا.\n• تابعوا دفتر الواجبات بانتظام.\n• استخدموا أسلوب التحفيز والثواب لتحسين الالتزام.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة.*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'vocab-16', title: 'عدم حفظ الكلمات', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* عدم حفظ الكلمات\n\nالطالب لا يظهر تحسنًا في حفظ الكلمات الجديدة مما يعيق تقدمه في المادة.\n*نصائح:*\n• اكدوا عليه اهمية حفظ الكلمات للتفوق في الانجلش.\n• قوموا بمراجعة الكلمات مع الطالب بعد الحفظ واكثر من مرة.\n• شجعوه على استخدام الكلمات في جمل.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'no-review-17', title: 'عدم مراجعة الدرس السابق', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* عدم مراجعة الدرس السابق قبل الحصة\n\nيلاحظ أن الطالب لا يكون مستعدًا للدرس مما يؤثر على تفاعله واستيعابه.\n*نصائح:*\n• راجعوا ملخص الدرس السابق مع الطالب قبل الحضور.\n• اطلبوا منه شرح ما تعلمه بلسانه.\n• خصصوا وقتًا بسيطًا للمراجعة اليومية.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'low-focus-18', title: 'قلة التركيز في الحصة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* قلة التركيز في الحصة\n\nيلاحظ أن الطالب لا يركز بشكل كاف أثناء الشرح مما يؤثر على مستواه وفهمه للدرس.\n*نصائح:*\n• تأكدوا من حصوله على قسط كاف من النوم.\n• قللوا من استخدام الشاشات قبل النوم.\n• تحدثوا معه عن أهمية التركيز لفهم الدرس وتحسين مستواه.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'missing-tools-19', title: 'عدم إحضار الملزمة/القلم', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* عدم إحضار أدوات الدرس\n\nيتكرر نسيان الطالب للملزمة أو القلم أو الكشكول مما يعيق مشاركته في الحصة والحل والتدريب.\n*نصائح:*\n• ساعدوه في تجهيز الادوات قبل الحصة بوقت كافى.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'late-attendance-20', title: 'الحضور متأخرًا للحصة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* الحضور متأخرًا للحصة\n\nالطالب يتأخر بشكل متكرر مما يؤدي إلى فوات جزء من الدرس.\n*نصائح:*\n• التأكيد عليه ان التاخير يؤثر على مستواه وفهمه للدرس.\n• حضّروا أدوات الدرس والواجب قبل الحصة بوقت كافى مسبقًا.\n• تحدثوا معه عن احترام الوقت والانضباط.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'repeated-absence-21', title: 'تكرار الغياب عن الحصة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* تكرار الغياب\n\nيلاحظ غياب الطالب عن عدة حصص دون عذر واضح، مما يؤثر على استمرارية تعليمه.\n*نصائح:*\n• التأكيد على أهمية الالتزام.\n• في حال وجود ظرف صحي، يرجى إعلامنا مسبقًا.\n• خصصوا وقتًا لتعويض ما فاته من دروس.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'careless-homework-22', title: 'حل الواجب بإهمال', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* حل الواجب بإهمال\n\nيتم حل الواجب بشكل سريع وغير دقيق مما يدل على عدم التركيز أو التسرع.\n*نصائح:*\n• راقبوا طريقة حله للواجب.\n• اطلبوا منه مراجعة الإجابات قبل التسليم.\n• وضّحوا له أن الواجب مش عقاب له ولكن دى خطوة مهمة وأساسية لفهم الدرس.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'phone-in-class-23', title: 'استخدام الموبايل في الحصة', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* استخدام الموبايل في الحصة\n\nلاحظنا استخدام الطالب الموبايل خلال الدرس، وهذا يؤثر سلبًا على التركيز والانضباط.\n*نصائح:*\n• راجعوا سياسات استخدام الموبايل مع الطالب.\n• يمكن تسليم الموبايل قبل بدء الحصة.\n• تحدثوا معه بهدوء عن الفرق بين وقت الدراسة ووقت الترفيه.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
    { id: 'bad-behavior-peers-24', title: 'سوء السلوك مع الزملاء', content: '*مكتب مستر // هاني العطار*\nالسيد ولي أمر الطالب: [اسم الطالب]\n*التاريخ:* [التاريخ]\n*الملاحظة:* سلوك غير لائق مع الزملاء\n\nلوحظ قيام الطالب بتصرفات غير لائقة مع زملائه أثناء الحصة، مما يؤثر على تركيزه وتركيز زملاؤه في الحصة.\n*نصائح:*\n• تحدثوا معه حول احترام الآخرين.\n• راجعوا معه مواقف حدثت وحاولوا تحليلها معه بهدوء.\n• علّموه أساليب التعبير عن النفس باحترام.\n*نرجو الرد من ولي الأمر للتأكد من استلام الرسالة*\n\n*✨💪 💪 هدفنا كلنا مصلحة الطالب ، وإنه يحقق أحسن حاجة ممكنة 💪✨ 💪*' },
];


type Mode = 'idle' | 'group' | 'individual' | 'exam_report' | 'templates' | 'whatsapp_groups';
const TEMPLATES_STORAGE_KEY = 'teachers_assistant_message_templates';
const WHATSAPP_GROUPS_STORAGE_KEY = 'teachers_assistant_whatsapp_groups';

const SendMessage: React.FC<SendMessageProps> = ({ onBack, students, centers }) => {
    const [mode, setMode] = useState<Mode>('idle');
    const [selectedCenterId, setSelectedCenterId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [message, setMessage] = useState('');
    const [examName, setExamName] = useState('');
    const [examGrade, setExamGrade] = useState('');
    
    const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
        try {
            const storedTemplates = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
            const parsed = storedTemplates ? JSON.parse(storedTemplates) : null;
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && 'id' in parsed[0]) {
                return parsed;
            }
            return DEFAULT_TEMPLATES;
        } catch {
            return DEFAULT_TEMPLATES;
        }
    });
    
    const [whatsAppGroups, setWhatsAppGroups] = useState<WhatsAppGroup[]>(() => {
        try {
            const stored = window.localStorage.getItem(WHATSAPP_GROUPS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [newTemplate, setNewTemplate] = useState({ title: '', content: '' });

    const [editingGroup, setEditingGroup] = useState<WhatsAppGroup | null>(null);
    const [newGroup, setNewGroup] = useState({ name: '', link: '' });


    useEffect(() => {
        try {
            window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
        } catch (error) {
            console.error("Failed to save templates to localStorage", error);
        }
    }, [templates]);

    useEffect(() => {
        try {
            window.localStorage.setItem(WHATSAPP_GROUPS_STORAGE_KEY, JSON.stringify(whatsAppGroups));
        } catch (error) {
            console.error("Failed to save WhatsApp groups to localStorage", error);
        }
    }, [whatsAppGroups]);

    const resetForm = () => {
        setSelectedCenterId(''); setSelectedGroupId(''); setSelectedStudentId('');
        setMessage(''); setExamName(''); setExamGrade('');
    };

    const handleSetMode = (newMode: Mode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSendWhatsApp = (phone: string, text: string, student?: Student) => {
        if (!phone) {
            alert('لا يوجد رقم واتساب مسجل.'); return;
        }
        let finalMessage = text;
        if (student) {
            finalMessage = finalMessage.replace(/\[اسم الطالب\]/g, student.name);
        }

        const encodedMessage = encodeURIComponent(finalMessage);
        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('01')) {
            formattedPhone = '20' + formattedPhone.substring(1);
        }
        const whatsappUri = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        window.open(whatsappUri, '_blank');
    };
    
    const availableGroups = useMemo<Group[]>(() => {
        if (!selectedCenterId) return [];
        const center = centers.find(c => c.id === selectedCenterId);
        return center ? Object.values(center.groupsByGrade).flat() : [];
    }, [selectedCenterId, centers]);

    const filteredStudents = useMemo(() => {
        if (!selectedGroupId) return [];
        return students.filter(s => s.groupId === selectedGroupId);
    }, [selectedGroupId, students]);
    
    const handleSelectTemplate = (content: string) => {
        let finalMessage = content;
        finalMessage = finalMessage.replace(/\[التاريخ\]/g, new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }));
        setMessage(finalMessage);
    };

    const titles: Record<Mode, string> = {
        idle: 'إرسال رسالة',
        group: 'رسالة جماعية لمجموعة',
        individual: 'رسالة لطالب محدد',
        exam_report: 'تقرير امتحان شامل',
        templates: 'مخزن الرسائل',
        whatsapp_groups: 'جروبات الواتساب',
    };

    const handleBack = () => mode === 'idle' ? onBack() : handleSetMode('idle');

    const handleAddTemplate = () => {
        if (newTemplate.title.trim() && newTemplate.content.trim()) {
            setTemplates(prev => [...prev, { ...newTemplate, id: `t${Date.now()}` }]);
            setNewTemplate({ title: '', content: '' });
        }
    };

    const handleUpdateTemplate = () => {
        if (!editingTemplate) return;
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
        setEditingTemplate(null);
    };
    
    const handleDeleteTemplate = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddGroup = () => {
        if (!newGroup.name.trim() || !newGroup.link.trim()) {
            alert('يرجى إدخال اسم ورابط للجروب.');
            return;
        }
        if (!newGroup.link.startsWith('https://chat.whatsapp.com/')) {
            alert('رابط الجروب غير صحيح. يجب أن يبدأ بـ https://chat.whatsapp.com/');
            return;
        }
        setWhatsAppGroups(prev => [...prev, { ...newGroup, id: `wg${Date.now()}` }]);
        setNewGroup({ name: '', link: '' });
    };

    const handleUpdateGroup = () => {
        if (!editingGroup) return;
         if (!editingGroup.link.startsWith('https://chat.whatsapp.com/')) {
            alert('رابط الجروب غير صحيح. يجب أن يبدأ بـ https://chat.whatsapp.com/');
            return;
        }
        setWhatsAppGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g));
        setEditingGroup(null);
    };

    const handleDeleteGroup = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الجروب؟')) {
            setWhatsAppGroups(prev => prev.filter(g => g.id !== id));
        }
    };

    const renderTemplatesSection = () => (
        <div className="mt-4">
            <h4 className="text-md font-semibold mb-2 text-teal-700 dark:text-teal-400">استخدام قالب:</h4>
            <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                    <button key={template.id} onClick={() => handleSelectTemplate(template.content)} title={template.content} className="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full hover:bg-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:hover:bg-teal-900">
                        {template.title}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderIdle = () => (
        <div className="flex flex-col gap-4">
            <ModeButton icon={UsersIcon} label={titles.group} onClick={() => handleSetMode('group')} />
            <ModeButton icon={UserIcon} label={titles.individual} onClick={() => handleSetMode('individual')} />
            <ModeButton icon={FileTextIcon} label={titles.exam_report} onClick={() => handleSetMode('exam_report')} />
            <ModeButton icon={BookIcon} label={titles.templates} onClick={() => handleSetMode('templates')} />
            <ModeButton icon={WhatsAppIcon} label={titles.whatsapp_groups} onClick={() => handleSetMode('whatsapp_groups')} />
        </div>
    );
    
    const renderGroup = () => (
        <div className="flex flex-col gap-4">
            <select value={selectedCenterId} onChange={e => setSelectedCenterId(e.target.value)} className="input-style">
                <option value="">-- اختر السنتر --</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="input-style" disabled={!selectedCenterId}>
                <option value="">-- اختر المجموعة --</option>
                {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="اكتب رسالتك هنا أو اختر قالبًا..." rows={5} className="input-style"></textarea>
            {renderTemplatesSection()}
            {selectedGroupId && (
                <div className="mt-4 border-t dark:border-slate-700 pt-4">
                    <h3 className="font-bold mb-2">طلاب المجموعة:</h3>
                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                        <div key={student.id} className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-md mb-2 shadow-sm">
                            <span>{student.name}</span>
                            <button onClick={() => handleSendWhatsApp(student.parentPhone || student.whatsapp, message, student)} disabled={!message || !(student.parentPhone || student.whatsapp)} className="send-button">
                                <SendIcon className="w-4 h-4" />
                                <span>إرسال</span>
                            </button>
                        </div>
                    )) : <p className="text-gray-500 dark:text-slate-400">لا يوجد طلاب في هذه المجموعة.</p>}
                </div>
            )}
        </div>
    );
    
    const renderIndividual = () => {
        const student = students.find(s => s.id === selectedStudentId);
        return (
         <div className="flex flex-col gap-4">
            <select value={selectedCenterId} onChange={e => { setSelectedCenterId(e.target.value); setSelectedGroupId(''); setSelectedStudentId(''); }} className="input-style">
                <option value="">-- اختر السنتر --</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedGroupId} onChange={e => { setSelectedGroupId(e.target.value); setSelectedStudentId(''); }} className="input-style" disabled={!selectedCenterId}>
                <option value="">-- اختر المجموعة --</option>
                {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="input-style" disabled={!selectedGroupId}>
                <option value="">-- اختر الطالب --</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="اكتب رسالتك هنا أو اختر قالبًا..." rows={5} className="input-style"></textarea>
            {renderTemplatesSection()}
            <button onClick={() => { if (student) handleSendWhatsApp(student.parentPhone || student.whatsapp, message, student); }} disabled={!selectedStudentId || !message} className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center gap-2 transition-colors mt-2">
                <SendIcon className="w-5 h-5"/>
                <span>إرسال الرسالة</span>
            </button>
        </div>
        );
    };
    
    const renderExamReport = () => {
        const student = students.find(s => s.id === selectedStudentId);
        const reportMessage = student ? `*مكتب مستر // هاني العطار*\nتقرير امتحان شامل للطالب/ ${student.name}\n*اسم الامتحان:* ${examName}\n*الدرجة:* ${examGrade}\nبرجاء متابعة الطالب/ة.` : '';
        return (
            <div className="flex flex-col gap-4">
                <select value={selectedCenterId} onChange={e => { setSelectedCenterId(e.target.value); setSelectedGroupId(''); setSelectedStudentId(''); }} className="input-style">
                    <option value="">-- اختر السنتر --</option>
                    {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={selectedGroupId} onChange={e => { setSelectedGroupId(e.target.value); setSelectedStudentId(''); }} className="input-style" disabled={!selectedCenterId}>
                    <option value="">-- اختر المجموعة --</option>
                    {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="input-style" disabled={!selectedGroupId}>
                    <option value="">-- اختر الطالب --</option>
                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" value={examName} onChange={e => setExamName(e.target.value)} placeholder="اسم الامتحان الشامل" className="input-style" />
                <input type="text" value={examGrade} onChange={e => setExamGrade(e.target.value)} placeholder="درجة الطالب" className="input-style" />
                 <button onClick={() => { if (student) handleSendWhatsApp(student.parentPhone || student.whatsapp, reportMessage, student); }} disabled={!selectedStudentId || !examName || !examGrade} className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center gap-2 transition-colors mt-2">
                    <SendIcon className="w-5 h-5"/>
                    <span>إرسال التقرير</span>
                </button>
            </div>
        );
    };

    const renderTemplates = () => (
        <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm flex flex-col gap-3">
                <h3 className="text-lg font-semibold">إضافة قالب جديد</h3>
                <input type="text" value={newTemplate.title} onChange={e => setNewTemplate(p => ({...p, title: e.target.value}))} placeholder="عنوان القالب (مثال: رسالة غياب)" className="input-style" />
                <textarea value={newTemplate.content} onChange={e => setNewTemplate(p => ({...p, content: e.target.value}))} placeholder="نص القالب..." rows={4} className="input-style"></textarea>
                <button onClick={handleAddTemplate} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-3 rounded-md inline-flex items-center justify-center gap-2 transition-colors self-start">
                    <PlusIcon className="w-5 h-5" /> <span>إضافة</span>
                </button>
            </div>
            <div className="flex flex-col gap-3 mt-4">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-teal-800 dark:text-teal-300">{template.title}</h4>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setEditingTemplate(template)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 mt-2 whitespace-pre-wrap text-sm">{template.content.substring(0, 100)}{template.content.length > 100 ? '...' : ''}</p>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderWhatsAppGroups = () => (
        <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm flex flex-col gap-3">
                <h3 className="text-lg font-semibold">إضافة جروب واتساب جديد</h3>
                <input type="text" value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="اسم الجروب (مثال: الصف الأول الثانوي)" className="input-style" />
                <input type="url" value={newGroup.link} onChange={e => setNewGroup(p => ({ ...p, link: e.target.value }))} placeholder="رابط دعوة الجروب" className="input-style ltr-input" />
                <button onClick={handleAddGroup} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-3 rounded-md inline-flex items-center justify-center gap-2 transition-colors self-start">
                    <PlusIcon className="w-5 h-5" /> <span>إضافة جروب</span>
                </button>
            </div>
            <div className="flex flex-col gap-3 mt-4">
                {whatsAppGroups.map((group) => (
                    <div key={group.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{group.name}</h4>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.open(group.link, '_blank')} className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-1 px-3 rounded-md transition-colors">فتح</button>
                                <button onClick={() => setEditingGroup(group)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteGroup(group.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{titles[mode]}</h2>
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
                    <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
                </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                {mode === 'idle' && renderIdle()}
                {mode === 'group' && renderGroup()}
                {mode === 'individual' && renderIndividual()}
                {mode === 'exam_report' && renderExamReport()}
                {mode === 'templates' && renderTemplates()}
                {mode === 'whatsapp_groups' && renderWhatsAppGroups()}
            </div>

            {editingTemplate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setEditingTemplate(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center">تعديل القالب</h3>
                        <input type="text" value={editingTemplate.title} onChange={e => setEditingTemplate(p => p ? {...p, title: e.target.value} : null)} placeholder="عنوان القالب" className="input-style"/>
                        <textarea value={editingTemplate.content} onChange={e => setEditingTemplate(p => p ? {...p, content: e.target.value} : null)} placeholder="نص القالب..." rows={8} className="input-style"></textarea>
                        <div className="flex gap-2 justify-end mt-2">
                            <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                            <button onClick={handleUpdateTemplate} className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">حفظ التعديلات</button>
                        </div>
                    </div>
                </div>
            )}
            
            {editingGroup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setEditingGroup(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center">تعديل جروب الواتساب</h3>
                        <input type="text" value={editingGroup.name} onChange={e => setEditingGroup(p => p ? {...p, name: e.target.value} : null)} placeholder="اسم الجروب" className="input-style"/>
                        <input type="url" value={editingGroup.link} onChange={e => setEditingGroup(p => p ? {...p, link: e.target.value} : null)} placeholder="رابط دعوة الجروب" className="input-style ltr-input" />
                        <div className="flex gap-2 justify-end mt-2">
                            <button onClick={() => setEditingGroup(null)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                            <button onClick={handleUpdateGroup} className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">حفظ التعديلات</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .input-style { background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.75rem; color: #1e293b; width: 100%; resize: vertical;}
                .input-style:disabled { background-color: #f1f5f9; cursor: not-allowed; opacity: 0.7; }
                .dark .input-style { background-color: #334155; border-color: #475569; color: #f1f5f9; }
                .dark .input-style:disabled { background-color: #1e293b; opacity: 0.5; }

                .send-button { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #14b8a6; color: white; font-size: 0.875rem; font-weight: bold; padding: 0.25rem 0.75rem; border-radius: 0.375rem; transition: background-color 0.2s; }
                .send-button:hover { background-color: #0d9488; }
                .send-button:disabled { background-color: #9ca3af; cursor: not-allowed; }
                .ltr-input { direction: ltr; text-align: left; }
            `}</style>
        </div>
    );
};

const ModeButton: React.FC<{icon: React.FC<{className?:string}>, label: string, onClick: () => void}> = ({icon: Icon, label, onClick}) => (
    <button onClick={onClick} className="w-full bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4 text-right hover:bg-teal-50 dark:hover:bg-slate-700/50 transition-colors">
        <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-full">
            <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400"/>
        </div>
        <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">{label}</span>
    </button>
);

export default SendMessage;