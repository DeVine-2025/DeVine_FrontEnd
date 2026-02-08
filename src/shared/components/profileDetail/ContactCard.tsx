import EmailIcon from "@assets/icons/email.svg?react";
import GitCatIcon from "@assets/icons/gitCat.svg?react";
import LinkedInIcon from "@assets/icons/linkedin.svg?react";

type ContactCardItemProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  content: string;
}

const ContactCardItem = ({Icon, title, content}: ContactCardItemProps) => {
  return(
    <div className="flex items-center gap-[1.6rem]">
      <div className="px-[0.9rem] py-[1.1rem] rounded-full border border-[1.60px] border-ui-100 inline-flex justify-center items-center">
        <Icon className="text-ui-500"/>
      </div>
      <div>
        <p className="text-ui-500 text-lg font-semibold">{title}</p>
        <p className="text-ui-700 text-lg">{content}</p>
      </div>
    </div>
  );
}

const ContactCard = () => {
  return (
    <div className="flex-col gap-[2rem]">
      <ContactCardItem Icon={EmailIcon} title={"Email"} content={"아ㅓ리ㅏ"}/>
      <ContactCardItem Icon={GitCatIcon} title={"Github"} content={"아ㅓ리ㅏ"}/>
      <ContactCardItem Icon={LinkedInIcon} title={"Linkedin"} content={"아ㅓ리ㅏ"}/>
    </div>
  );
};

export default ContactCard;