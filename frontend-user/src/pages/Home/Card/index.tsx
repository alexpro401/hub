/* eslint-disable @typescript-eslint/no-unused-expressions */
import clsx from "clsx";
import Link from "@material-ui/core/Link";
import useStyles from "./style";
import { useCardStyles } from "../style";
import Image from "../../../components/Base/Image";
import { TOKEN_TYPE } from "../../../constants";
import { formatCampaignStatus } from "../../../utils";
import React from "react";

type Props = {
  card: { [k: string]: any };
  title?: string | React.ReactElement;
  [k: string]: any;
};
export const Card = ({ card, title, ...props }: Props) => {

  const styles = { ...useStyles(), ...useCardStyles() };
  // const isOpen = card.campaign_status === "Filled";
  const isTicket = card.token_type === TOKEN_TYPE.ERC721;
  return (
    <div className={clsx(styles.card, props.className, styles.cardOpening)}>
      <div className={clsx(styles.cardImg, styles.cardImgUpcoming)}>
        <h4>{formatCampaignStatus(card.campaign_status)}</h4>
        <Image src={card.banner} />
      </div>
      <div className="title">
        {title}
      </div>
      <Link
        href={`/#/${isTicket ? "buy-nft" : "buy-token"}/${card.id}`}
        className={clsx(styles.btnDetail, "btn-detail")}
      >
        Detail
      </Link>
    </div>
  );
};
