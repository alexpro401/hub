import React, { useEffect, useMemo, useState } from 'react'
import DefaultLayout from '@layout-components/DefaultLayout'
import WrapperContent from '@base-components/WrapperContent'
import useStyles from './style';
import clsx from 'clsx';
import { Button, Switch, FormGroup, FormControlLabel } from '@material-ui/core';
import { SearchBox } from '@base-components/SearchBox';
import SelectBox from '@base-components/SelectBox';
import { Link } from 'react-router-dom';
import { getVectorIcon } from '@base-components/Icon';
import CardMarketplace from '@base-components/CardMarketplace';
import { useFetchV1 } from '@hooks/useFetch';
import { ObjectType } from '@app-types';
import axios from '@services/axios';
import { getContractInstance } from '@services/web3';
import erc721ABI from '@abi/Erc721.json';
import { useSelector } from 'react-redux';
import { useTypedSelector } from '@hooks/useTypedSelector';

const Marketplace = () => {
    const styles = useStyles();
    const cards = [
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        // { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        // { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        // { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
        // { name: 'Legion', image: '/images/marketplace/character1.png', network: 'eth', iconNetwork: '/images/icons/bsc.png', price: '0.11 ETH', usdPrice: '40.42', tags: ['Character', 'Fixed Price'], iconToken: '/images/icons/mech-master.png', tokenName: 'MECH MASTER', interactions: { views: 3100, hearts: 300 } },
    ]

    const [filterType, setFilterType] = useState<boolean>(true);
    const [selectPrice, setSelectPrice] = useState('newest');
    const pricesFilter = useMemo(() => ([
        { name: 'Newest', value: 'newest' },
        { name: 'Price high - low', value: 'Price high - low' },
        { name: 'Price low - high', value: 'Price low - high' }
    ]), []);
    const [selectType, setSelectType] = useState('all');
    const listTypes = useMemo(() => ([
        { name: 'All', value: 'all' },
        { name: 'My Listing', value: 'mylisting' },
        { name: 'My Auctions', value: 'myauctions' },
    ]), [])

    const projects = [
        { name: 'Mech Master BOX', icon: '/images/icons/bsc.png', desc: 'Mech Master is a strategic turn-based RPG game where players are open to build ...', image: '/images/marketplace/character1.png' },
        { name: 'Mech Master BOX', icon: '/images/icons/bsc.png', desc: 'Mech Master is a strategic turn-based RPG game where players are open to build ...', image: '/images/marketplace/character1.png' },
        { name: 'Mech Master BOX', icon: '/images/icons/bsc.png', desc: 'Mech Master is a strategic turn-based RPG game where players are open to build ...', image: '/images/marketplace/character1.png' },
        { name: 'Mech Master BOX', icon: '/images/icons/bsc.png', desc: 'Mech Master is a strategic turn-based RPG game where players are open to build ...', image: '/images/marketplace/character1.png' },
        { name: 'Mech Master BOX', icon: '/images/icons/bsc.png', desc: 'Mech Master is a strategic turn-based RPG game where players are open to build ...', image: '/images/marketplace/character1.png' },
    ]

    const { data: hostCollections = {} as ObjectType<any>, loading: loadingHostCollection } = useFetchV1('/marketplace/collections');
    const perPage = 10;
    const [offerData, setOfferData] = useState<any>({
        page: 1,
        total: 1,
        data: {},
    })
    const { appChainID } = useSelector((state: any) => state.appNetwork).data;
    const connectorName = useTypedSelector(state => state.connector).data;
    const { data: hostOffer = {} as ObjectType<any>, loading: loadingHostOffer } = useFetchV1('/marketplace/hot-offers');
    useEffect(() => {

        if (hostOffer?.data?.length) {
            const run = async () => {
                const collections: ObjectType<any> = [];
                await Promise.all(hostOffer.data.map((item: any) => new Promise(async (res) => {
                    const result = await axios.get(`/marketplace/collection/${item.token_address}`);
                    const projectInfo = result.data.data;
                    if (!projectInfo) return;
                    const useExternalUri = !!+projectInfo.use_external_uri;
                    const erc721Contract = getContractInstance(erc721ABI, projectInfo.token_address, connectorName, appChainID);
                    if (!erc721Contract) return;
                    item.project = projectInfo;
                    try {
                        if (useExternalUri) {
                            const result = await axios.post(`/marketplace/collection/${projectInfo.token_address}/${item.token_id}`);
                            const info = result.data.data || {};
                            Object.assign(item, info);
                            res('');
                        } else {
                            const tokenURI = await erc721Contract.methods.tokenURI(item.token_id).call();
                            const infoBoxType = (await axios.get(tokenURI)).data || {};
                            Object.assign(item, infoBoxType);
                            res('');
                        }
                        collections.push(item);
                    } catch (error) {
                        item.image = '';
                        console.log('err', error)
                        collections.push(item);
                        res('')
                    }
                })));
                const page = 1;
                const total = +hostOffer.total || 0;
                setOfferData((data: any) => ({
                    page,
                    total,
                    data: {
                        ...data.data,
                        [page]: collections,
                    }
                }))
            }
            run();
        }
    }, [hostOffer, connectorName, appChainID]);

    console.log('hostOffer', offerData)

    return (
        <DefaultLayout>
            <WrapperContent useShowBanner={false}>
                <div className={styles.page}>
                    <div className={styles.banner}>
                        <button className="btn btn-arrow btn-prev">
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70083 13.3731C7.30787 13.7642 6.67076 13.7642 6.27781 13.3731L0.585733 7.70798C0.192777 7.31689 0.192777 6.6828 0.585733 6.29171C0.595523 6.28196 0.605465 6.27246 0.615551 6.2632L6.27927 0.626327C6.67222 0.235234 7.30933 0.235234 7.70229 0.626327C8.09524 1.01742 8.09524 1.65151 7.70229 2.0426L2.72085 7.00043L7.70083 11.9568C8.09378 12.3479 8.09378 12.982 7.70083 13.3731Z" fill="black" />
                            </svg>
                        </button>
                        <div className="desc">
                            <div className="img-banner">
                                <img src="/images/marketplace/banner.png" alt="" />
                            </div>
                            <div className="infor">
                                <h3>Mech Master BOX</h3>
                                <p>Mech Master is a strategic turn-based RPG game where players are open to build their own territory with future technologies and protect their homeland.</p>
                            </div>
                        </div>
                        <button className="btn btn-arrow btn-next">
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.299175 13.3731C0.69213 13.7642 1.32924 13.7642 1.72219 13.3731L7.41427 7.70798C7.80722 7.31689 7.80722 6.6828 7.41427 6.29171C7.40448 6.28196 7.39454 6.27246 7.38445 6.2632L1.72073 0.626327C1.32778 0.235234 0.690669 0.235234 0.297714 0.626327C-0.0952421 1.01742 -0.0952435 1.65151 0.297712 2.0426L5.27915 7.00043L0.299175 11.9568C-0.093781 12.3479 -0.0937806 12.982 0.299175 13.3731Z" fill="black" />
                            </svg>
                        </button>
                    </div>
                    <div className="content-page">
                        {/* <div className={styles.header}>
                            <div className="title">
                                <h3>Marketplace</h3>
                            </div>
                            <div className="filter">
                                <div className="item">
                                    <Button className={styles.btnFilter}>
                                        <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4.55755 5.72237C4.68463 5.86067 4.7544 6.04132 4.7544 6.2282V11.735C4.7544 12.0665 5.15433 12.2347 5.39105 12.0017L6.92723 10.2412C7.1328 9.99453 7.24618 9.87242 7.24618 9.62824V6.22945C7.24618 6.04257 7.31719 5.86191 7.44303 5.72361L11.851 0.940647C12.1811 0.581831 11.927 0 11.4386 0H0.561964C0.0735754 0 -0.181832 0.580585 0.149575 0.940647L4.55755 5.72237Z" fill="white" />
                                        </svg>
                                        Filter
                                    </Button>
                                    <FormGroup>
                                        <SelectBox
                                            onChange={(e) => setSelectType(e.target.value as string)}
                                            items={listTypes}
                                            itemNameValue="value"
                                            itemNameShowValue="name"
                                            defaultValue={selectType}
                                            value={selectType} /> */}
                        {/* <FormControlLabel
                                            classes={{ label: styles.labelSwitch }}
                                            control={<Switch checked={filterType} onChange={(e) => setFilterType(e.target.checked)} classes={{
                                                track: clsx(styles.bgSwitch, { checked: filterType }),
                                                checked: styles.colorSwitch,
                                            }} />} className="switch" label="My Listing" /> */}
                        {/* </FormGroup> */}
                        {/* <FormGroup>
                                        <FormControlLabel
                                            classes={{ label: styles.labelSwitch }}
                                            control={<Switch checked={filterType} onChange={(e) => setFilterType(e.target.checked)} classes={{
                                                track: clsx(styles.bgSwitch, { checked: filterType }),
                                                checked: styles.colorSwitch,
                                            }} />} className="switch" label="My Auctions" />
                                     </FormGroup> */}
                        {/* </div>
                                <div className="item">
                                    <div className="input-search">
                                        <SearchBox placeholder="Search NFT name - Creator" />
                                    </div>
                                    <SelectBox
                                        onChange={(e) => setSelectPrice(e.target.value as string)}
                                        items={pricesFilter}
                                        itemNameValue="value"
                                        itemNameShowValue="name"
                                        defaultValue={selectPrice}
                                        value={selectPrice} />
                                </div>
                            </div>
                        </div> */}
                        <div className={styles.content}>
                            <div className={styles.section}>
                                <div className="header">
                                    <h3>Hot Collections</h3>
                                    <div className="slide-actions">
                                        <button className="btn-prev">
                                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.77611 9.78015C5.48139 10.0735 5.00356 10.0735 4.70884 9.78014L0.439788 5.53133C0.145071 5.23801 0.145071 4.76244 0.439788 4.46912C0.448266 4.46068 0.456896 4.45249 0.465668 4.44453L4.71033 0.21999C5.00505 -0.0733301 5.48288 -0.0733303 5.77759 0.21999C6.07231 0.513309 6.07231 0.988875 5.77759 1.2822L2.04127 5.00081L5.77611 8.71794C6.07082 9.01126 6.07082 9.48682 5.77611 9.78015Z" fill="#000000" />
                                            </svg>
                                        </button>
                                        <button className="btn-next">
                                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.223893 9.78015C0.51861 10.0735 0.99644 10.0735 1.29116 9.78014L5.56021 5.53133C5.85493 5.23801 5.85493 4.76244 5.56021 4.46912C5.55173 4.46068 5.5431 4.45249 5.53433 4.44453L1.28967 0.21999C0.994953 -0.0733301 0.517123 -0.0733303 0.222406 0.21999C-0.0723105 0.513309 -0.07231 0.988875 0.222407 1.2822L3.95873 5.00081L0.223893 8.71794C-0.0708241 9.01126 -0.0708241 9.48682 0.223893 9.78015Z" fill="#000000" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className={clsx(styles.hostCollections, "custom-scroll")}>
                                    {
                                        (hostCollections?.data || []).map((p: ObjectType<any>, id: number) => <Link to={`/collection/${p.token_address}`}>
                                            <div className="collection" key={id}>
                                                <div className="img">
                                                    {p.image && <img src={p.image} alt="" />}
                                                    {p.logo && <img src={p.logo} className="icon" alt="" />}
                                                </div>
                                                <div className="infor">
                                                    <h3>{p.name}</h3>
                                                    <p>{p.description}</p>
                                                </div>
                                            </div>
                                        </Link>)
                                    }
                                </div>
                            </div>
                            {/* <div className={styles.section}>
                                <div className="header">
                                    <h3>Hot Auction</h3>
                                    <div></div>
                                </div>
                                <div className={styles.cards}>
                                    {
                                        cards.map((card, id) => <Link key={id} to={`/marketplace/${id}`}>
                                            <CardMarketplace item={card} id={id} />
                                        </Link>
                                        )}
                                </div>
                            </div> */}
                            <div className={styles.section}>
                                <div className="header">
                                    <h3>Big Offers</h3>
                                    <div className="filter">
                                        <div className="item">
                                            <FormGroup>
                                                <SelectBox
                                                    onChange={(e) => setSelectType(e.target.value as string)}
                                                    items={listTypes}
                                                    itemNameValue="value"
                                                    itemNameShowValue="name"
                                                    defaultValue={selectType}
                                                    value={selectType} />
                                            </FormGroup>
                                        </div>
                                        <div className="item">
                                            <FormGroup>
                                                <SelectBox
                                                    onChange={(e) => setSelectType(e.target.value as string)}
                                                    items={listTypes}
                                                    itemNameValue="value"
                                                    itemNameShowValue="name"
                                                    defaultValue={selectType}
                                                    value={selectType} />
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.cards}>
                                    {
                                        (offerData?.data?.[offerData.page] || []).map((item: any, id: number) => <Link key={id} to={`/collection/${item.project?.token_address}/${item.token_id}`}>
                                            <CardMarketplace item={item} id={id} />
                                        </Link>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </WrapperContent>
        </DefaultLayout>
    )
}

export default Marketplace
