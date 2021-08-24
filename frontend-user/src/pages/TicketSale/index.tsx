import React, { useCallback, useEffect, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import useStyles, { useCardStyles } from './style';
import { ActiveCard } from './ActiveCard';
import { UpcomingCard } from './UpcomingCard';
import DefaultLayout from '../../components/Layout/DefaultLayout'
import withWidth, { isWidthDown, isWidthUp } from '@material-ui/core/withWidth';
import { CompleteCard } from './CompleteCard';
import { Link } from '@material-ui/core';
import { useFetchV1 } from '../../hooks/useFetch';
import { TOKEN_TYPE } from '../../constants';

type ResponseData = {
  data: { [k: string]: any }[],
  lastPage: number,
  page: number,
  perPage: number,
  total: number
}

const TicketSale = (props: any) => {
  const styles = { ...useStyles(), ...useCardStyles() };
  const [recall, setRecall] = useState(true);
  const refresh = useCallback(() => {
    setRecall(true);
  }, [setRecall]);
  const {
    data: activePools = {} as ResponseData,
    loading: loadingActivePools
  } = useFetchV1(`/pools/active-pools?token_type=${TOKEN_TYPE.ERC721}&limit=10&page=1`, recall);
  const {
    data: upcomingPools = {} as ResponseData,
    loading: loadingUpcomingPools
  } = useFetchV1(`/pools/upcoming-pools?token_type=${TOKEN_TYPE.ERC721}&limit=10&page=1`, recall);
  console.log(upcomingPools)
  const {
    data: compeltePools = {} as ResponseData,
    loading: loadingcompletePools
  } = useFetchV1(`/pools/complete-sale-pools?token_type=${TOKEN_TYPE.ERC721}&limit=10&page=1`, recall);

  useEffect(() => {
    if(!loadingActivePools && !loadingUpcomingPools && !loadingcompletePools) {
      setRecall(false);
    }
  }, [loadingActivePools, loadingUpcomingPools, loadingcompletePools])


  return (
    <DefaultLayout>
      <section className={clsx(styles.pools, styles.section)}>
        <div className="rectangle">
          <img src="/images/landing/rectangle.png" alt="" />
        </div>

        <div className={styles.poolItem}>
          <h3>Active Pools</h3>

          <div className={clsx(styles.cards, styles.cardsActive)}>
            {
              (activePools?.data || []).map((card, id) => <ActiveCard key={id} card={card} refresh={refresh}/>)
            }

          </div>
        </div>

        <div className={styles.poolItem}>
          <h3>Upcoming</h3>

          <div className={clsx(styles.cards, styles.cardsUpcoming)}>
            {
              (upcomingPools?.data || []).map((card, id: number) => <UpcomingCard key={id} card={card} refresh={refresh} />)
            }
          </div>
        </div>
      </section>
      <section className={clsx(styles.completePools, styles.section)}>
        <div className="rectangle">
          <img src="/images/landing/rectangle-black.png" alt="" />
        </div>
        <div className={styles.poolItem}>
          <h3>Complete Sale</h3>

          <div className={clsx(styles.cards, styles.completeCards)}>
            {
              (compeltePools?.data || []).map((card, id) => <CompleteCard key={id} card={card} />)
            }
          </div>
          <div className={styles.cardsActions}>
            <Link href={'transactionLink'} className={styles.btnView}>
              View all pools
            </Link>
          </div>
        </div>
      </section>
      <section className={clsx(styles.section, styles.contact)}>
        <div className="rectangle">
          <img src="/images/subcriber.svg" alt="" />
        </div>
        <h3>
          Get the Latest in Your Inbox
        </h3>
        <div className={styles.contactForm}>
          <form action="">
            <TextField className={styles.inputForm} label="Email" variant="outlined" placeholder="Enter your Email" />
            <Button className={styles.btnForm}>
              Subscribe
            </Button>
          </form>

          <div className={styles.alertMsg}>
            <img src={'/images/warning-red.svg'} alt="" />
            <span>Something wrong was happened. Please try again later!</span>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default withWidth()(withRouter(TicketSale));
