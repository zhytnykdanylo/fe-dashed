import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container } from "reactstrap";

import {
  addChart,
  removeChartByIndex,
  resetChart,
} from "../../store/general-dashboard/actions";

// import Breadcrumbs from "../../components/Common/Breadcrumb";
import TitleBar from "../../components/Common/TitleBar";
import ActionButtons from "../../components/Common/ChartActionButtons";
import ChartPicker from "../../components/Common/ChartPicker";
import BTCCard from "./btc-card";
import BTCPerformance from "./BTCPerformance";
import LiveFundingRates from "./LiveFundingRates/index";

import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import RiskRatingCard from "./RiskRatingCard";
import BTCFundingRatesCard from "./BTCFundingRatesCard";

const ResponsiveGridLayout = WidthProvider(Responsive);

const initialLayouts = {
  xxl: [
    { i: "a", x: 0, y: 0, w: 9, h: 15, minW: 6, minH: 15, maxW: 12, maxH: 20 },
    { i: "b", x: 9, y: 0, w: 3, h: 15, minW: 3, minH: 15, maxW: 4, maxH: 20 },
    { i: "c", x: 0, y: 15, w: 6, h: 15, minW: 6, minH: 15, maxW: 12, maxH: 25 },
    { i: "d", x: 6, y: 15, w: 6, h: 15, minW: 6, minH: 15, maxW: 12, maxH: 25 },
    { i: "e", x: 0, y: 30, w: 6, h: 15, minW: 6, minH: 12, maxW: 12, maxH: 20 },
  ],
  lg: [
    {
      i: "a",
      x: 0,
      y: 0,
      w: 12,
      h: 15,
      minW: 12,
      minH: 15,
      maxW: 12,
      maxH: 20,
    },
    { i: "b", x: 8, y: 15, w: 4, h: 15, minW: 4, minH: 15, maxW: 6, maxH: 20 },
    { i: "c", x: 0, y: 15, w: 8, h: 15, minW: 6, minH: 15, maxW: 12, maxH: 25 },
    {
      i: "d",
      x: 0,
      y: 30,
      w: 12,
      h: 15,
      minW: 12,
      minH: 15,
      maxW: 12,
      maxH: 25,
    },
    {
      i: "e",
      x: 0,
      y: 45,
      w: 12,
      h: 15,
      minW: 12,
      minH: 12,
      maxW: 12,
      maxH: 20,
    },
  ],
};

const _elements = {
  a: <BTCCard />,
  b: <RiskRatingCard />,
  c: <BTCFundingRatesCard />,
  d: <LiveFundingRates />,
  e: <BTCPerformance />,
};

const GeneralDashboard = () => {
  const dispatch = useDispatch();
  const { layoutLarge, layoutMd } = useSelector(
    state => state.GeneralChartSetting
  );
  document.title = "General Dashboard | Dashed by Lacuna";

  const [modalOpen, setModalOpen] = useState(false);

  const [layouts, setLayouts] = useState();

  const removeItem = index => {
    dispatch(removeChartByIndex(index));
  };

  const addItem = content => {
    const i = layoutLarge.length + 1;
    let newChartData = {
      xxl: {
        i: i.toString(),
        x: i % 2 == 0 ? 6 : 0,
        y: Infinity,
        w: 6,
        h: 4,
        content,
      },
      lg: {
        i: i.toString(),
        x: i % 2 == 0 ? 6 : 0,
        y: Infinity,
        w: 12,
        h: 4,
        content,
      },
    };
    dispatch(addChart(newChartData));
  };

  const handleResetChart = () => {
    dispatch(resetChart());
  };

  return (
    <>
      <div className="page-content">
        <Container fluid={true}>
          {/* <Breadcrumbs title="Dashboards" breadcrumbItem="General" /> */}
          <TitleBar
            title="General Dashboard"
            onAddChart={() => setModalOpen(true)}
            onResetChart={handleResetChart}
          />

          <ResponsiveGridLayout
            className="layout"
            breakpoints={{
              xxl: 1400,
              xl: 1120,
              lg: 992,
              md: 768,
              sm: 576,
              xs: 0,
            }}
            cols={{ xxl: 12, xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}
            containerPadding={[0, 24]}
            layouts={{ xxl: layoutLarge, lg: layoutMd }}
            margin={[24, 24]}
            rowHeight={10}
            autoSize
          >
            {layoutLarge.map(({ i, content: Content }) => (
              <div key={i}>
                <ActionButtons onRemove={() => removeItem(i)} />
                <Content />
              </div>
            ))}
          </ResponsiveGridLayout>
          <ChartPicker
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            chartPicked={addItem}
          />
        </Container>
      </div>
    </>
  );
};

export default GeneralDashboard;
