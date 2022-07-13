import React from 'react'
import { Card, CardBody } from 'reactstrap'
import CountUp from 'react-countup'

import ChartActionButtons from 'components/Common/ChartActionButtons'

import ImgUp from '../../../../assets/images/positive.png'
import ImgDown from '../../../../assets/images/negative.png'
import './StatisticsCard.scss'

export default function StatisticsCard({ title, description, value, change }) {
  return (
    <>
      <ChartActionButtons />
      <Card className="statistics-card">
        <CardBody>
          <h4 className="title">{title}</h4>
          <p className="description">{description}</p>
          <p className="value">
            <CountUp
              start={Number(value) - (Number(value) / 10)}
              end={value}
              duration={2.75}
              separator=","
              decimals={0}
              delay={0}
            />
          </p>
          <div className="change">
            {Number(change) > 0 && (
              <>
                <img className="me-2" src={ImgUp} alt="Up" />
                +
              </>
            )}
            {Number(change) < 0 && (
              <>
                <img className="me-2" src={ImgDown} alt="Down" />
              </>
            )}
            {change} %
          </div>
        </CardBody>
      </Card>
    </>
  )
}
