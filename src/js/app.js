import React, { Component, createRef } from 'react';
import ReactDOM from 'react-dom';
import './../sass/main.scss';
// import ResizeObserver from 'react-resize-observer';
// import ResizeObserver from 'resize-observer-polyfill';
import Exchange2 from '../images/exchange2.svg';
import Money from '../images/pound-sterling.svg';
import Sack from '../images/business.svg';

const reqSvgs = require.context('../images', false, /\.(svg)$/);
const flagMap = reqSvgs.keys().reduce((images, path) => {
    const key = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
    images[key] = reqSvgs(path).default
    return images
}, {})

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromCurrency: 'AED',
            rates: '',
            // address: 'https://prime.exchangerate-api.com/v5/a8613015618eb762bd66a2b2/latest/AED',
            address: 'https://prime.exchangerate-api.com/v5/f97fd0f7deb0dd20c0ce7560/latest/AED',
            wantedCurrency: 'AED',
            number: 0,
            isReversed: false,
            isClearBtnClicked: false,
            isResized: true
        }
    }


    handleErrors = (response) => {
        if (!response.ok) {
            alert('Failed to fetch data');
            throw Error(response.statusText);
        }
        return response;
    }

    fetchData = (url) => {
        fetch(url).
            then(this.handleErrors).
            then(response => response.json()).
            then(info => {
                this.setState({
                    rates: info.conversion_rates,
                })
            }).catch((error) => {
                console.error('Error:', error);
                alert('Error while fetching data');
            })

    }




    componentDidMount() {
        const container = document.querySelector('.mainContainer');

        // Doesn't work on Firefox
        container.addEventListener('resize', this.handleResize);

        // Works on Firefox
        const resizeObserver = new ResizeObserver((entries) => {
            console.log("Hello World");
            this.handleResize()
        });

        
        console.log(container);
        resizeObserver.observe(container)
      
        this.fetchData(this.state.address);
    }

    componentWillUnmount() {
        clearTimeout(timeOut)
    }


    changeFromHandler = (e) => {
        this.setState({
            fromCurrency: e.target.value,
        }, () => {
            this.setState({
                // address: 'https://prime.exchangerate-api.com/v5/a8613015618eb762bd66a2b2/latest/' + this.state.fromCurrency,
                address: 'https://prime.exchangerate-api.com/v5/f97fd0f7deb0dd20c0ce7560/latest/' + this.state.fromCurrency,
            }, () => {
                this.fetchData(this.state.address)
            })
        })

    }

    changeToHandler = (e) => {
        this.setState({
            wantedCurrency: e.target.value
        })
    }

    inputNumberHandler = (e) => {
        this.setState({
            number: e.target.value
        })
    }

    blurHandler = (e) => {
        if (e.target.value < 0) {
            this.setState({
                number: e.target.value * (-1)
            })
        }
        else if (isNaN(e.target.value)) {
            this.setState({
                number: 0
            })
        }
    }


    handleReverse = (e) => {
        this.setState({
            fromCurrency: this.state.wantedCurrency,
            wantedCurrency: this.state.fromCurrency,
            // address: 'https://prime.exchangerate-api.com/v5/a8613015618eb762bd66a2b2/latest/' + this.state.wantedCurrency,
            address: 'https://prime.exchangerate-api.com/v5/f97fd0f7deb0dd20c0ce7560/latest/' + this.state.wantedCurrency,

            isReversed: false ? true : false,
        }, () => this.fetchData(this.state.address))

    }

    handleClean = (e) => {

        this.setState({
            fromCurrency: 'AED',
            wantedCurrency: 'AED',
            number: 0,
            // address: 'https://prime.exchangerate-api.com/v5/a8613015618eb762bd66a2b2/latest/AED',
            address: 'https://prime.exchangerate-api.com/v5/f97fd0f7deb0dd20c0ce7560/latest/AED',
            isClearBtnClicked: true

        }, () => {
            this.fetchData(this.state.address);
            setTimeout(
                function () {
                    this.setState({
                        isClearBtnClicked: false

                    });
                }.bind(this)
                , 500)
        })
    }

    handleResize = () => {
        this.setState({
            isResized: false
        }, () => {
            const timeOut = setTimeout(() => {
                this.setState({
                    isResized: true
                }, () => console.log('Działa'))
            })
        })

    }


    render() {

        const array = Object.keys(this.state.rates).sort();
        const array2 = this.state.isReversed === false ? array.filter(key => key === this.state.wantedCurrency) : array.filter(key => key === this.state.fromCurrency);
        let currentRate;
        currentRate = this.state.rates[array2];
        const optionFrom = array.map((item) =>
            <option name={item} value={item} key={item}>{item}</option>
        )

        const FlagFrom = flagMap[this.state.fromCurrency];
        const FlagTo = flagMap[this.state.wantedCurrency];

        const newDate = new Date();
        const date = newDate.getDate();
        const month = newDate.getMonth();
        const year = newDate.getFullYear();

        let result;
        if (!currentRate) {
            result = '0 ' + this.state.wantedCurrency
        } else if (this.state.number < 0 && currentRate) {
            result = (this.state.number * currentRate * (-1)).toFixed(4) + ' ' + this.state.wantedCurrency
        } else if (isNaN(this.state.number)) {
            result = '0 ' + this.state.wantedCurrency
        }
        else {
            result = (this.state.number * currentRate).toFixed(4) + ' ' + this.state.wantedCurrency
        }

        const rateInfo = () => {
            if (isNaN(this.state.number)) {
                return (
                    <div className="rateInfo">

                        0 {this.state.fromCurrency} = {result}
                    </div>
                )
            }
            else if (this.state.number < 0) {
                return (
                    <div className="rateInfo">

                        {this.state.number * (-1)} {this.state.fromCurrency} = {result}
                    </div>
                )
            }
            else {
                return (
                    <div className="rateInfo rateInfo1">

                        {this.state.number} {this.state.fromCurrency} = {result}
                    </div>
                )

            }

        }


        return (
            <div className="mainContainer">
                <div className="currencyConverterContainer">


                    <div className="title">
                        <div className={this.state.isResized ? "title title2 animation" : "title title2 nonAnimation"}>Currency Converter
                            <div className={this.state.isResized ? "line" : "nonLine"}></div>
                        </div>
                    </div>
                    <Money className="iconOfMoney"></Money>

                    <div className="selectCurrencyPart">
                        <div className="selectContainers">
                            <label htmlFor="options">Base&nbsp;currency</label>
                            <div className="selectPlusFlag">
                                <FlagFrom className="flag"></FlagFrom>
                                <select id="options" name="fromCurrency" value={this.state.fromCurrency} onChange={this.changeFromHandler} >
                                    {optionFrom}
                                </select>
                            </div>

                        </div>
                        <div className="reverseContainer">
                            <Exchange2 fill="blue" className="reverse" onClick={this.handleReverse}></Exchange2>
                        </div>

                        <div className="selectContainers">
                            <label htmlFor="options">Target&nbsp;currency</label>
                            <div className="selectPlusFlag">
                                <FlagTo className="flag"></FlagTo>
                                <select id="options2" name="wantedCurrency" value={this.state.wantedCurrency} onChange={this.changeToHandler}>
                                    {optionFrom}
                                </select>
                            </div>

                        </div>

                    </div>
                    <div className="amountContainer">
                        <div className="amountToConvert">
                            <label htmlFor="amountToConvert">Money to convert</label>
                            <input className="number" type="text" value={this.state.number} onChange={this.inputNumberHandler} onBlur={this.blurHandler}></input>
                        </div>

                        <div className="sackContainer">
                            <Sack className="sack"></Sack>
                        </div>

                        <div className="resultPart">
                            <div className="resultLabel">Result</div>
                            <div className="result">
                                {result}
                            </div>
                        </div>

                    </div>
                    <div className="summingUpPart">
                        <button className={this.state.isClearBtnClicked ? "wave" : "nonWave"} onClick={this.handleClean}>Clear</button>
                        {rateInfo()}
                        <div>
                            <div className="rateInfo rateInfo3">Rate on {date}-{month < 10 ? `0${month + 1}` : `${month + 1}`}-{year}: </div>
                            <div className="rateInfo rateInfo2">  1 {this.state.fromCurrency} = {currentRate ? currentRate + ' ' + this.state.wantedCurrency : '1 ' + this.state.wantedCurrency} </div>
                        </div>

                        {/* <div className="contribution">Icons of flags, arrows made by <i><a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a></i> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                        <div className="contribution">Icon of sack made by <i><a href="https://www.flaticon.com/authors/becris" title="Becris">Becris</a></i> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div> 
                        <div className="contribution">Icon of pounds made by <i><a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a></i></div> */}

                    </div>
                </div>
            </div>
        )
    }

}

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(
        <>
            <App />
        </>,
        document.getElementById('app')
    )

})
