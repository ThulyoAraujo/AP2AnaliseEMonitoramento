import React, { Component } from 'react';
import Cliente from "./Cliente";
import Atendimento from './Atendimento';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import AutorenewIcon from '@material-ui/icons/Autorenew';

const MAX_RANDOM = 4; //eventos maximos que entram na fila
let eventoInterval = null;
let filaInterval = null;

//Variaveis necessarias para o funcionamento essencial ********************
let tempoAtendimentoTotal = 0;
let atendidosTotal = 0;
let filaDaMedia = [];
let tempoTotalNaFila = 0;
let clientesTotalFila = 0;
//********************************

export default class Eds extends Component {

    constructor(props){
        super(props);
        this.state = this._initialState();
    }

    _initialState = () => {
        return {
            fila: [],
            atendimento: [],
            filaLog: '',
            tamanhoDafila: '',
            paused: true,
            tempoMaximoAtendimento: 10,
            tempoMinimoAtendimento: 1,
            tempoAtendimento: 0,
            //Como sao setadas assim que o programa inicia ********************
            tempoMedioDoAtendimento: 0,
            tempoMedioDaFila: 0,
            tempoMedioDoSistema: 0,
            //*************************************
            btnText: 'Iniciar Sistema',
        };
    }

    _iniciarAtendimento = () => {

        let tempoAtendimento = 5;

        let incTime = () => {
            let { paused } = this.state;
            let fila = this.state.fila;
            let total = fila.length;
            
            //Média na fila ********
            let k = 1
            ++filaDaMedia[0];
            tempoTotalNaFila = filaDaMedia[0];
            while(k < total){
                filaDaMedia[k] = filaDaMedia[k] + 1;
                tempoTotalNaFila = tempoTotalNaFila + filaDaMedia[k];
               ++k;
            }
            // *************

            if (!paused && fila.length >= 1) {
               
                if (tempoAtendimento === 0) { 

                    //Escolhendo o menor da fila ***************
                    let i = 1;
                    let j;
                    let menorAtual = fila[0];

                     while(i < total){

                         if(menorAtual > fila[i]){
                              menorAtual = fila[i];
                                j = i;
                          } else {
                             menorAtual = menorAtual;
                          }
                       ++i;
                    }
                        let atendimento = [ fila[j] ];
                        tempoAtendimento = menorAtual;
                        //**************************

                        //Media atendimento *********************
                        tempoAtendimentoTotal = tempoAtendimentoTotal + menorAtual;
                        atendidosTotal = atendidosTotal + 1;

                        //Medias gerais ************************
                        let tempoMedioDoAtendimento = tempoAtendimentoTotal/atendidosTotal;
                        let tempoMedioDaFila = tempoTotalNaFila/clientesTotalFila;
                        let tempoMedioDoSistema = tempoMedioDoAtendimento + tempoMedioDaFila;

                    // remove o evento da fila
                    fila.splice(j, 1);
                    filaDaMedia.splice(j, 1);
        
                    // Seta o estado
                    this.setState({
                        fila: fila,
                        atendimento: atendimento,
                        tamanhoDafila: this._getTamanhoDafilaText(),
                        tempoMedioDoAtendimento: tempoMedioDoAtendimento,
                        tempoMedioDaFila: tempoMedioDaFila,
                        tempoMedioDoSistema: tempoMedioDoSistema
                    }, function(){});
                }

                this.setState({ tempoAtendimento: tempoAtendimento }, () => {
                    tempoAtendimento -= 1;
                })
            }
        }

        eventoInterval = setInterval(incTime, 1000);
    }

    _gerenciarFila = () => {
        filaInterval = setInterval(() => {
            let { fila, paused, tempoMaximoAtendimento, tempoMinimoAtendimento } = this.state;
            // Verifica o status do sistema
            if (!paused) {
                // Random eventos a adicionar na fila
                let random = Math.floor(Math.random() * MAX_RANDOM) + 1;
                // Adiciona os novos eventos
                for (let i = 0; i < random; ++i) {
                    // Random entre o menor e o maior tempo ***********************
                    let min = Math.ceil(tempoMinimoAtendimento)
                    let max = Math.floor(tempoMaximoAtendimento)
                    let eventTime = Math.floor(Math.random() * (max - min + 1)) + min;
                    // ****************
                    fila.push(eventTime)
                    filaDaMedia.push(0);

                    //Saber quantos clientes tenho na fila ****************
                    ++clientesTotalFila;
                    //*********************
                }
                // Seta o estado
                this.setState({
                    fila: fila,
                    filaLog: this._getFilaLogText(random),
                    tamanhoDafila: this._getTamanhoDafilaText()
                })
            }
        }, 3500)
    }

    _getFilaLogText = (n) => {
        let evento = n === 1 ? 'evento' : 'eventos';
        let entrou = n === 1 ? 'entrou' : 'entraram';
        return n + ' ' + evento + ' ' + entrou + ' na fila.';
    }

    _getTamanhoDafilaText = (n) => {
        let evento = n === 1 ? 'evento' : 'eventos';
        return 'Total de ' + this.state.fila.length + ' ' + evento + ' na fila.'
    }

    _handlerBtnOnClick = () => {
        let paused = this.state.paused
        let btnText = paused ? 'Pausar Sistema' : this._initialState().btnText;
        this.setState({
            paused: !paused,
            btnText: btnText
        })
    }

    _handlerRestartOnClick = () => {
        this.setState(this._initialState(), () => {})
    }

    _handlerInputTempoMaximoAtendimentoOnChange = (e) => {
        if (e.target.value <= 1) {
            this.setState({ tempoMaximoAtendimento: 1 })
        } else {
            this.setState({ tempoMaximoAtendimento: e.target.value })
        }
    }
    
    _handlerInputTempoMinimoAtendimentoOnChange = (e) => {
        if (e.target.value >= 1) {
            this.setState({ tempoMinimoAtendimento: 1 })
        } else {
            this.setState({ tempoMinimoAtendimento: e.target.value })
        }
    }

    componentDidMount() {
        this._gerenciarFila();
        this._iniciarAtendimento();
    }

    componentWillUnmount() {
        clearInterval(eventoInterval);
        clearInterval(filaInterval);
    }

    render() {
        return (
            <div className='container' style={{ marginTop: '10px' }}>
                <div className="d-inline-block" style={{ marginLeft: '5px' }}>
                    <h3>UniFBV - Shortest Job First</h3>
                    {
                        this.state.paused ?
                            <span className="form-text text-warning">
                                Sistema pausado !!!
                            </span> :
                            <span className="form-text text-success">
                                Sistema em execução ...
                            </span>
                    }
                </div>

                {/* Botoes */}
                <div className="float-md-right">
                    <button className='btn btn-md btn-primary'
                        onClick={this._handlerBtnOnClick}
                        style={{ marginRight: '5px', marginTop: '3px' }}>
                        {this.state.paused ? <PlayArrowIcon /> : <PauseIcon />}
                            {this.state.btnText}
                    </button>
                    <button className='btn btn-md btn-danger'
                        onClick={this._handlerRestartOnClick}
                        style={{ marginRight: '5px', marginTop: '3px' }}>
                        <AutorenewIcon /> Reinciar Sistema
                    </button>
                </div>

                <hr />

                <div className="row">
                    {/* Eventos em execucao */ }
                    <div className="col-md-7">
                        <div className="">
                            <h4>Evento em execução:</h4>
                            {
                                this.state.atendimento.map((v, k) => (
                                    <Atendimento key={k} text={ v + ' sec' } />
                                ))
                            }
                            <p id="numero_atendentes" className="form-text text-muted">
                                {this.state.tempoAtendimento} segundos para iniciar o próximo evento.
                            </p>
                            {/* toFixed, para corrigir as casas decimas **************** */}
                            <p id="media_atendimento" className="form-text text-muted">
                                {this.state.tempoMedioDoAtendimento.toFixed(3)} segundos em média no atendimento.
                            </p>
                            <p id="media_fila" className="form-text text-muted">
                                {this.state.tempoMedioDaFila.toFixed(3)} segundos em média na fila.
                            </p>
                            <p id="media_sistema" className="form-text text-muted">
                                {this.state.tempoMedioDoSistema.toFixed(3)} segundos em média no sistema.
                            </p>
                        </div>
                    </div>

                    {/* Configuracoes */}
                    <div className="col-md-5">
                        <div className="form-group">
                            <input type="number" className="form-control" id="time_max"
                                onChange={this._handlerInputTempoMaximoAtendimentoOnChange}
                                value={this.state.tempoMaximoAtendimento}
                                min="1" />
                            <small id="time_max" className="form-text text-muted">
                                Define o tempo máximo de um evento em execução em segundos
                            </small>


                            {/*  Formulário do tempo mínimo */}
                            <input type="number" className="form-control" id="time_min"
                                onChange={this._handlerInputTempoMinimoAtendimentoOnChange}
                                value={this.state.tempoMinimoAtendimento}
                                min="1" />
                            <small id="time_min" className="form-text text-muted">
                                Define o tempo mínimo de um evento em execução em segundos
                            </small>


                        </div>
                    </div>
                </div>



                {/* Eventos em fila de espera */ }
                <div className="jumbotron">
                    <h4>{this.state.filaLog}</h4>
                    {
                        this.state.fila.map((v, k) => (
                            <Cliente
                                key={ k }
                                top='0%'
                                left={ '0%' }
                                text={ v + ' sec' }
                            />
                        ))
                    }
                    <h4 className='text-primary'>{this.state.tamanhoDafila}</h4>
                </div>

                <p className='float-md-right'>Shortest Job First (SJF) based Event-driven simulation (EDS) by Fabio Santos, 2020.</p>
            </div>
        );
    }
}