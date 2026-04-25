import EmailIcon from '@assets/icons/email.svg?react';
import GitCatIcon from '@assets/icons/gitCat.svg?react';
import LinkedInIcon from '@assets/icons/linkedin.svg?react';

type ContactCardItemProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  content: string;
};

const ContactCardItem = ({ Icon, title, content }: ContactCardItemProps) => {
  return (
    <div className="flex items-center gap-[1.6rem]">
      <div className="inline-flex items-center justify-center rounded-full border border-ui-100 px-[0.9rem] py-[1.1rem]">
        <Icon className="text-ui-500" />
      </div>
      <div>
        <p className="font-semibold text-lg text-ui-500">{title}</p>
        <p className="text-lg text-ui-700">{content}</p>
      </div>
    </div>
  );
};

type ContactCardProps = {
  contacts?: {
    type: 'EMAIL' | string;
    value: string;
    link: string;
  }[];
};

const ContactCard = ({ contacts = [] }: ContactCardProps) => {
  const findContactByType = (type: string) => {
    return contacts?.find((contact) => contact.type.toUpperCase() === type.toUpperCase());
  };

  const contactTypes = [
    { type: 'EMAIL', Icon: EmailIcon, title: 'Email' },
    { type: 'GITHUB', Icon: GitCatIcon, title: 'Github' },
    { type: 'LINKEDIN', Icon: LinkedInIcon, title: 'Linkedin' },
  ];

  return (
    <div className="flex-col gap-[2rem]">
      {contactTypes.map(({ type, Icon, title }) => {
        const contact = findContactByType(type);
        const content = contact?.value || '등록된 정보가 없습니다';

        return <ContactCardItem key={type} Icon={Icon} title={title} content={content} />;
      })}
    </div>
  );
};

export default ContactCard;
