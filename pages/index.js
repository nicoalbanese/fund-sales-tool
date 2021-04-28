import { useState } from "react";
import styled from "styled-components";

import Link from "next/link";

const Title = styled.h1`
  /* font-size: 2em; */
  color: ${({ theme }) => theme.colors.primary};
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  /* justify-content: center; */
  height: 100vh;
  width: 100%;
  flex-direction: column;
  width: clamp(500px, 80%, 1000px);
  margin: 3rem auto;
`;

const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  /* flex-direction: column; */
  /* align-items: center; */
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};

  select,
  input {
    padding: 0.5rem 1rem;
    font-size: 1.3rem;
  }

  input[type="submit"] {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
  }

  label {
    margin-top: 1rem;
  }

  .option-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
`;

const Summary = styled.div`
  padding: 2rem;
  background: white;
  margin-top: 2rem;
  span {
    font-weight: bold;
  }
`;

export default function Home() {
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [fund, setFund] = useState("ASCEND 15");
  const [atData, setAtData] = useState();
  const [metrics, setMetrics] = useState();
  const [request, setRequest] = useState();

  const [password, setPassword] = useState();

  const fetchData = async () => {
    if (investmentAmount) {
      const res = await fetch(
        `https://api.airtable.com/v0/appUdh14c6zo2HVSm/Investment%20Rounds?filterByFormula={Fund}='${fund}'`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_KEY}`,
          },
        }
      );
      const data = await res.json();
      console.log(data.records);
      const formattedData = data.records.map((company) =>
        formatData(company.fields)
      );
      calculateMetrics(formattedData);
      setRequest({ fund, amount: investmentAmount });
      setAtData(formattedData);
      // setAtData(formattedData);
    } else {
      alert("please insert an investment amount");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const formatData = (raw) => {
    return {
      name: raw["Company (formula)"],
      amountInvested: raw["Amount Invested"],
      website: raw["Investee Business Website"],
      multiple: raw["Multiple"],
      seis: raw["Investment Type"],
      currentValue: raw["Current Value"],
      status: raw["Investee Business Status"]
    };
  };

  const calculateMetrics = (data) => {
    const fundSize = data.reduce((acc, cv) => {
      return acc + cv.amountInvested;
    }, 0);

    const currentTotalValue = data.reduce((acc, cv) => {
      return acc + cv.currentValue;
    }, 0);

    const investorPercentage = investmentAmount / fundSize;
    console.log(investorPercentage);

    const incomeTaxRelief = fund.includes("ASCEND") ? 0.5 : 0.3;

    setMetrics({
      fundSize,
      currentTotalValue,
      investorPercentage,
      incomeTaxRelief,
    });
  };

  const handleSetPassword = (passwordAttempt) => {
    setPassword(passwordAttempt);
  };

  return (
    <Container>
      {password !== process.env.NEXT_PUBLIC_PASSWORD ? (
        <PasswordProtect handleSetPassword={handleSetPassword} />
      ) : (
        <>
          <Title>Ascension Historical Investment Calculator</Title>
          <Form action='submit' onSubmit={handleSubmit}>
            <div className='option-container'>
              <label htmlFor='fund'>Fund</label>
              <select
                name='fund'
                id='fund'
                value={fund}
                onChange={(e) => {
                  console.log("changed...", e.target.value);
                  setFund(e.currentTarget.value);
                }}
              >
                <option value='ASCEND 15'>Ascension SEIS 2015</option>
                <option value='ASCEND 16'>Ascension SEIS 2016</option>
                <option value='ASCEND 17'>Ascension SEIS 2017</option>
                <option value='ASCEND 18'>Ascension SEIS 2018</option>
                <option value='ASCEND 19 (I)'>Ascension SEIS 2019 (I)</option>
                <option value='ASCEND 19 (II)'>Ascension SEIS 2019 (II)</option>
                <option value='ASCEND 20'>Ascension SEIS 2020</option>
                <option value='CENTAUR EIS 17'>CENTAUR EIS 2017</option>
                <option value='CENTAUR EIS 18'>CENTAUR EIS 2018</option>
                <option value='CENTAUR EIS Evergreen (2018-2019)'>
                  CENTAUR EIS Evergreen (2018-2019)
                </option>
                <option value='CENTAUR EIS Evergreen (2019-2020) (Reyker)'>
                  CENTAUR EIS (2019-2020) - Reyker
                </option>
                <option value='CENTAUR EIS Evergreen (2019-2020) (Mainspring)'>
                  CENTAUR EIS EG (2019-2020) - Mainspring
                </option>
                <option value='Ascension EIS Fund 2020'>
                  Ascension EIS Fund 2020
                </option>
              </select>
            </div>
            <div className='option-container'>
              <label htmlFor='amount'>Investment Amount (£)</label>
              <input
                type='number'
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                name='amount'
                id='amount'
              />
            </div>
            <input type='submit' value='Calculate' />
          </Form>
          {atData && (
            <>
              <Summary>
                If you had invested{" "}
                <span>£{Number(request.amount).toLocaleString()}</span> into{" "}
                {request.fund}, it would be worth{" "}
                <span>
                  £
                  {(
                    metrics.currentTotalValue * metrics.investorPercentage
                  ).toLocaleString()}
                </span>{" "}
                (excluding{" £"}
                {(
                  metrics.fundSize *
                  metrics.investorPercentage *
                  metrics.incomeTaxRelief
                ).toLocaleString()}{" "}
                in income-tax relief.)
              </Summary>
              <Table
                atData={atData}
                investmentAmount={investmentAmount}
                fund={fund}
                metrics={metrics}
              />
            </>
          )}{" "}
        </>
      )}
    </Container>
  );
}

const PasswordContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    * {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
  }
`;

const PasswordProtect = ({ handleSetPassword }) => {
  const [passwordAttempt, setPasswordAttempt] = useState();
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSetPassword(passwordAttempt);
  };
  return (
    <PasswordContainer>
      <form action='submit' onSubmit={handleSubmit}>
        <label htmlFor='password'>Enter Password</label>
        <input
          type='text'
          value={passwordAttempt}
          onChange={(e) => setPasswordAttempt(e.currentTarget.value)}
        />
        <input type='submit' value='enter' />
      </form>
    </PasswordContainer>
  );
};

const TableContainer = styled.table`
  margin-top: 2rem;
  background: white;
  width: 100%;

  th {
    background-color: darkslategray;
    color: white;
  }
  a {
    color: darkblue;
  }

  th,
  td {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    text-align: left;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  tfoot {
    background: slategray;
    color: white;
    font-weight: bold;
  }
`;

const Table = ({ atData, investmentAmount, fund, metrics }) => {
  const {
    fundSize,
    currentTotalValue,
    investorPercentage,
    incomeTaxRelief,
  } = metrics;

  return (
    <TableContainer>
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Approx Investment</th>
          <th>Approx Income Tax Relief</th>
          <th>Status</th>
          <th>Multiple</th>
          <th>Current Value</th>
        </tr>
      </thead>
      <tbody>
        {atData.map((company, idx) => {
          return (
            <Investment
              investment={company}
              investmentAmount={investmentAmount}
              key={idx}
              investorPercentage={investorPercentage}
            />
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td></td>
          <td>£{(fundSize * investorPercentage).toLocaleString()}</td>
          <td>
            £
            {(fundSize * investorPercentage * incomeTaxRelief).toLocaleString()}
          </td>
          <td></td>
          <td>{(currentTotalValue / fundSize).toLocaleString()}</td>
          <td>£{(currentTotalValue * investorPercentage).toLocaleString()}</td>
        </tr>
      </tfoot>
    </TableContainer>
  );
};

const Investment = ({ investment, investmentAmount, investorPercentage }) => {
  console.log(investmentAmount);

  const incomeTaxRelief =
    investment.seis === "SEIS"
      ? investment.amountInvested * investorPercentage * 0.5
      : investment.amountInvested * investorPercentage * 0.3;

  return (
    <tr>
      <td>
        {investment.website ? (
          <Link href={investment.website}>
            <a href={investment.website} target="_blank">{investment.name}</a>
          </Link>
        ) : (
          <>{investment.name}</>
        )}
      </td>
      <td>
        £{(investment.amountInvested * investorPercentage).toLocaleString()}
      </td>
      <td>£{incomeTaxRelief.toLocaleString()}</td>
      <td>{investment.status}</td>
      <td>{investment.multiple.toLocaleString()}</td>
      <td>
        £{(investment.currentValue * investorPercentage).toLocaleString()}
      </td>
    </tr>
  );
};
